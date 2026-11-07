const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({});
['norms.js', 'calculations.js'].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
});
const calc = context.ParkingCalc;
const norms = context.ParkingNorms;
const scenario = overrides => ({
  capacity: 100, ev: 0, type: 'above', purpose: 'permanent', zone: 'residential', fire: 'I', ...overrides,
});
const san = (capacity, category = 'housing', scenarioOptions = {}, options = {}) => {
  const result = calc.sanitary(scenario({ capacity, ...scenarioOptions }), {
    method: 'table', sectional: 'no', actual: '', target: category, ...options,
  });
  return result.metrics[norms.sanitary.findIndex(row => row.id === category)];
};
const special = (capacity, options = {}, scenarioOptions = {}) => calc.special(
  scenario({ capacity, ...scenarioOptions }),
  { context: 'general', accessibleCount: 7, medicalRate: 15, ...options },
);
const metric = (result, label) => result.metrics.find(row => row.label.startsWith(label));
const geometry = (capacity, options = {}, scenarioOptions = {}) => calc.geometry(
  scenario({ capacity, type: 'open', ...scenarioOptions }),
  { vehicle: 'medium', traffic: 'one', aisleMode: 'rear90', clearance: 0, ...options },
);

test('input parsing accepts Ukrainian decimals and rejects invalid / unsafe values', () => {
  assert.equal(calc.number('1 234,5', 'Площа'), 1234.5);
  assert.equal(calc.number('1.5', 'Площа'), 1.5);
  ['', 'abc', '-1', '1,2,3', '1e3', 'Infinity', '9007199254740992'].forEach(input => {
    assert.throws(() => calc.number(input, 'Площа'));
  });
  assert.throws(() => calc.number('1.5', 'Місць', { integer: true }));
  assert.throws(() => calc.scenario(scenario({ ev: 101 })));
  assert.throws(() => calc.scenario(scenario({ capacity: 0 })));
  assert.throws(() => calc.scenario(scenario({ fire: 'invalid' })));
  assert.equal(calc.optionalNumber('', 'Розмір'), null);
});

test('table 1: 100 places, open parking and all garage floor variants', () => {
  const first = calc.areas({ type: 'above', mode: 'places', value: 100, floors: ['1'] })[0];
  assert.equal(first.buildArea, 2500);
  assert.equal(first.siteArea, 3000);
  const upper = calc.areas({ type: 'above', mode: 'places', value: 100, floors: ['7-9'] })[0];
  assert.equal(upper.buildArea, 400);
  assert.equal(upper.siteArea, 600);
  const open = calc.areas({ type: 'open', mode: 'places', value: 100 })[0];
  assert.equal(open.buildArea, null);
  assert.equal(open.siteArea, 2500);
  assert.equal(calc.areas({ type: 'above', mode: 'places', value: 100, floors: norms.floors.map(row => row.id) }).length, 7);
  assert.throws(() => calc.areas({ type: 'open', mode: 'build', value: 100 }));
  assert.throws(() => calc.areas({ type: 'above', mode: 'places', value: 100.5, floors: ['1'] }));
  assert.throws(() => calc.areas({ type: 'above', mode: 'places', value: 100, floors: [] }));
});

test('area modes use full places, preserve remaining area and respect underground scope', () => {
  const result = calc.areas({ type: 'above', mode: 'site', value: 900, floors: ['3'] })[0];
  assert.equal(result.capacity, 64);
  assert.equal(result.buildArea, 640);
  assert.equal(result.siteArea, 896);
  assert.equal(result.remaining, 4);
  const build = calc.areas({ type: 'above', mode: 'build', value: 1000, floors: ['2'] })[0];
  assert.equal(build.capacity, 66);
  assert.equal(build.siteArea, 1320);
  assert.equal(build.remaining, 10);
  const small = calc.areas({ type: 'above', mode: 'site', value: '0,1', floors: ['1'] })[0];
  assert.equal(small.capacity, 0);
  assert.equal(small.remaining, 0.1);
  assert.equal(calc.areas({ type: 'underground', mode: 'places', value: 100, floors: ['6'] })[0].unavailable, true);
  assert.throws(() => calc.areas({ type: 'above', mode: 'site', value: 0, floors: ['1'] }));
});

test('housing: one-room factor, separate permanent / guest rounding and explicit formulas', () => {
  const result = calc.demand({ category: 'housing', housing: 'middle', amount: 10, second: 20 });
  assert.equal(result.quantity, 25);
  assert.equal(result.permanent, 20);
  assert.equal(result.temporary, 4);
  assert.equal(result.total, 24);
  assert.match(result.formula, /гостьові/);
  const social = calc.demand({ category: 'housing', housing: 'social', amount: 1, second: 0 });
  assert.equal(social.permanent, 1);
  assert.equal(social.temporary, 1);
  assert.throws(() => calc.demand({ category: 'housing', housing: 'central', amount: 0, second: 0 }));
});

test('all public and industrial rows evaluate within the selected normative range', () => {
  norms.demand.forEach(category => {
    const amount = category.area ? category.exclusiveMin ? 6000 : (category.area[0] + category.area[1]) / 2 : 100;
    const input = { category: category.id, amount, rate: category.range[1], businessArea: 101, businessType: 'business' };
    const result = calc.demand(input);
    assert(result.total >= result.min && result.total <= result.max, category.id);
    assert.throws(() => calc.demand({ ...input, rate: category.range[0] - 0.1 }), category.id);
  });
  assert.equal(calc.demand({ category: 'national', amount: 100, rate: 20 }).total, 20);
  assert.equal(calc.demand({ category: 'universityStudents', amount: 101, rate: 5 }).total, 6);
  assert.equal(calc.demand({ category: 'motel', amount: 12, rate: 100 }).total, 12);
  assert.equal(calc.demand({ category: 'industrial', amount: 100, rate: 10 }).temporary, 10);
  assert.equal(calc.demand({ category: 'fleet', amount: 12, rate: 1 }).permanent, 12);
  assert.throws(() => calc.demand({ category: 'business', amount: 100, rate: 10, businessArea: 100 }));
  assert.equal(calc.demand({ category: 'business', amount: 100, rate: 10, businessType: 'social' }).total, 10);
  assert.throws(() => calc.demand({ category: 'shopSmall', amount: 501, rate: 2 }));
  assert.equal(calc.demand({ category: 'shopSmall', amount: 500, rate: 2 }).review, true);
});

test('conditional corrections require both an applicable rule and an explicit basis', () => {
  const input = { category: 'national', amount: 100, rate: 20, correction: 'local', percent: -20 };
  assert.throws(() => calc.demand(input));
  assert.throws(() => calc.demand({ ...input, confirmed: true }));
  assert.equal(calc.demand({ ...input, confirmed: true, basis: 'Підтверджене обґрунтування' }).total, 16);
  assert.throws(() => calc.demand({ ...input, percent: -21, confirmed: true, basis: 'Документ' }));
  assert.throws(() => calc.demand({ ...input, category: 'industrial', rate: 10, confirmed: true, basis: 'Документ' }));
  assert.equal(calc.demand({
    category: 'park', amount: 100, rate: 10, correction: 'park', percent: 50,
    confirmed: true, basis: 'Метро, пішохідні підходи',
  }).total, 5);
  assert.throws(() => calc.demand({
    category: 'religious', amount: 100, rate: 10, correction: 'park', percent: 50, confirmed: true, basis: 'Документ',
  }));
  const housing = calc.demand({
    category: 'housing', housing: 'central', amount: 0, second: 100,
    correction: 'residential', percent: 20, confirmed: true, basis: 'ДПТ',
  });
  assert.equal(housing.permanent, 80);
  assert.equal(housing.temporary, 12);
});

test('mixed objects sum individually rounded contributions', () => {
  const a = calc.demand({ category: 'national', amount: 1, rate: 20 });
  const b = calc.demand({ category: 'national', amount: 1, rate: 20 });
  assert.equal(calc.mixedDemand([a, b]).total, 2);
});

test('sanitary table boundaries and missing values are preserved', () => {
  const capacities = [10, 11, 50, 51, 100, 101, 300, 301];
  const expected = {
    housing: [10, 15, 15, 25, 25, 35, 35, 50],
    ends: [10, 10, 10, 15, 15, 25, 25, 35],
    public: [10, 10, 10, 15, 15, 25, 25, 25],
    school: [15, 25, 25, 25, 25, 50, 50, null],
    hospital: [25, 50, 50, null, null, null, null, null],
  };
  Object.entries(expected).forEach(([category, values]) => capacities.forEach((capacity, index) => {
    const result = san(capacity, category);
    assert.equal(result.value, values[index], category + ': ' + capacity);
    if (values[index] === null) assert.equal(result.status, 'approval');
  }));
});

test('distance counts use ICE places and neighbors strictly nearer than 6m', () => {
  assert.equal(san(100, 'housing', { ev: 50 }).value, 15);
  const neighbor = { capacity: 1, ev: 0, type: 'above', fire: 'I', distance: 5.99 };
  assert.equal(san(10, 'housing', {}, { neighbors: [neighbor] }).value, 15);
  assert.equal(san(10, 'housing', {}, { neighbors: [{ ...neighbor, distance: 6 }] }).value, 10);
  assert.equal(san(100, 'housing', { ev: 100 }, { actual: 100 }).status, 'electric');
  assert.equal(san(100, 'housing', { type: 'underground' }).status, 'notApplicable');
});

test('interpolation has numeric endpoints only and never uses a 1000-place anchor', () => {
  assert.equal(san(30, 'housing', {}, { method: 'interpolate' }).value, 12.5);
  assert.equal(san(51, 'housing', {}, { method: 'interpolate' }).value, 15.2);
  assert.equal(san(11, 'housing', {}, { method: 'interpolate' }).value, 10.2);
  assert.equal(san(301, 'housing', {}, { method: 'interpolate' }).value, 50);
  assert.equal(san(51, 'hospital', {}, { method: 'interpolate' }).status, 'approval');
  assert.throws(() => san(30, 'housing', { type: 'open' }, { method: 'interpolate' }));
});

test('25% reduction and source-specific 12m / 50m rules require their actual conditions', () => {
  const reduced = { method: 'reduce', noWindows: 'yes', noEntrances: 'yes' };
  assert.equal(san(10, 'housing', {}, reduced).value, 7.5);
  assert.throws(() => san(10, 'housing', { type: 'open' }, reduced));
  assert.throws(() => san(10, 'housing', { fire: 'III' }, reduced));
  assert.throws(() => san(10, 'housing', {}, { ...reduced, noWindows: 'unknown' }));
  assert.throws(() => san(10, 'housing', {}, { ...reduced, neighbors: [{ capacity: 1, ev: 0, type: 'above', distance: 5 }] }));
  assert.equal(san(11, 'public', { fire: 'III' }).value, 12);
  assert.equal(san(11, 'public', { fire: 'IIIa' }).value, 10);
  assert.equal(san(10, 'public', { fire: 'IIIa' }).value, 12);
  assert.equal(san(101, 'housing', { type: 'open' }, { sectional: 'yes' }).value, 50);
  assert.equal(san(300, 'housing', { type: 'open' }, { sectional: 'yes' }).value, 50);
  assert.equal(san(100, 'housing', {}, { sectional: 'yes', neighbors: [{ capacity: 1, ev: 0, distance: 5, type: 'open' }] }).value, 50);
  assert.equal(san(101, 'housing', { type: 'open' }, { sectional: 'unknown', actual: 40 }).status, 'review');
  assert.equal(san(101, 'housing', { type: 'open' }, { sectional: 'unknown', actual: 20 }).status, 'fail');
  assert.equal(san(10, 'housing', { fire: 'unknown' }, { actual: 11 }).status, 'review');
  assert.equal(san(10, 'housing', {}, { actual: 10 }).status, 'pass');
  assert.equal(san(10, 'housing', {}, { actual: 9.99 }).status, 'fail');
});

test('accessible quantities retain ranges, boundary ambiguity and individual calculations', () => {
  assert.equal(metric(special(99), 'Спільний').value, 4);
  assert.equal(metric(special(99, { actualAccessible: 4 }, { type: 'open' }), 'Спільний').status, 'review');
  assert.equal(metric(special(99, { context: 'other', actualAccessible: 4 }, { type: 'open' }), 'Спільний').status, 'pass');
  assert.equal(metric(special(99, { context: 'service' }, { type: 'above', purpose: 'temporary' }), 'Спільний').status, 'individual');
  assert.equal(metric(special(99, { accessibleWidth: 3.5 }), 'Ширина доступного').status, 'review');
  assert.equal(metric(special(99, { context: 'service', accessibleWidth: 3.5 }, { type: 'open' }), 'Ширина доступного').status, 'pass');
  assert.equal(metric(special(100), 'Спільний').value, 7);
  assert.equal(metric(special(100, { accessibleCount: 4 }), 'Спільний').status, 'review');
  assert.equal(metric(special(101, { accessibleCount: 5 }), 'Спільний').value, 5);
  assert.equal(metric(special(200), 'Спільний').value, 7);
  assert.equal(metric(special(201), 'Спільний').status, 'individual');
  assert.equal(metric(special(1), 'Спільний').status, 'fail');
  assert.equal(metric(special(100, { context: 'service', accessibleCount: 4 }, { type: 'open' }), 'Спільний').value, 10);
  assert.equal(metric(special(100, { context: 'service', accessibleCount: 4 }, { type: 'open' }), 'Спільний').status, 'calculated');
  assert.equal(metric(special(201, { context: 'service' }, { type: 'open' }), 'Спільний').status, 'review');
  assert.equal(metric(special(50, { context: 'ambulatory', medicalRate: 15 }, { type: 'open' }), 'Спільний').value, 8);
});

test('EV reservations, charging points and accumulation use total capacity independently of ICE', () => {
  const result = special(101);
  assert.equal(metric(result, 'Місця для електромобілів').value, 6);
  assert.equal(metric(result, 'Точки зарядки').value, 11);
  assert.equal(metric(special(101, {}, { zone: 'unknown' }), 'Точки зарядки').status, 'review');
  assert.equal(metric(geometry(300), 'Накопичувальний').status, 'notApplicable');
  assert.equal(metric(geometry(301), 'Місткість накопичувального').value, 2);
  assert.equal(metric(geometry(301, {}, { purpose: 'temporary' }), 'Місткість накопичувального').value, 4);
  assert.equal(metric(geometry(301, {}, { ev: 301 }), 'Місткість накопичувального').value, 2);
});

test('open parking dimensions, emergency exits and garage-only tables stay separate', () => {
  assert.equal(metric(geometry(50), 'Ширина машиномісця').value, 2.5);
  assert.equal(metric(geometry(50, { compact: true }, { purpose: 'temporary' }), 'Ширина машиномісця').value, 2.3);
  assert.throws(() => geometry(50, { compact: true }));
  assert.equal(metric(geometry(50), 'Ширина об’єднаного').value, 4.5);
  [[50, 0], [51, 1], [200, 1], [201, 2], [400, 2], [401, 3]].forEach(([capacity, expected]) => {
    assert.equal(metric(geometry(capacity), 'Аварійні').value, expected);
  });
  assert.equal(metric(geometry(100, { traffic: 'two' }), 'Ширина проїзду').value, 6);
  assert.equal(metric(geometry(100, { vehicle: 'large' }), 'Габарити машиномісця').status, 'individual');
  assert.equal(metric(geometry(100, {}, { type: 'above' }), 'Ширина внутрішнього').value, 6.1);
  assert.equal(metric(geometry(100, { aisleMode: 'front90' }, { type: 'above' }), 'Ширина внутрішнього').value, 7.7);
  assert.equal(metric(geometry(100, { vehicle: 'tiny', aisleMode: 'front45' }, { type: 'above' }), 'Ширина внутрішнього').value, 2.7);
  assert.equal(metric(geometry(100, { vehicle: 'large' }, { type: 'above' }), 'Ширина внутрішнього').status, 'individual');
  assert.equal(metric(geometry(100, { clearance: 4 }, { type: 'above' }), 'Між автомобілем і колоною').value, 0.3);
  assert.equal(metric(geometry(100, { clearance: 1 }, { type: 'above' }), 'Від торця до стаціонарного устаткування').value, null);
  assert.equal(metric(geometry(100, { clearance: 1 }, { type: 'above' }), 'Від торця до стаціонарного устаткування').status, 'notApplicable');
});

test('CSV includes BOM, semicolons, decimal commas, quote escaping and formula protection', () => {
  const output = calc.csv([['Розділ', 'Значення'], ['=1+1', 1.5], ['Текст; "лапки"', null]]);
  assert(output.startsWith('\uFEFF'));
  assert(output.includes('";"'));
  assert(output.includes('"1,5"'));
  assert(output.includes('"\'=1+1"'));
  assert(output.includes('"Текст; ""лапки"""'));
  assert(output.includes('\r\n'));
});

test('large exact integer inputs do not lose places through floating point tolerance', () => {
  const result = calc.demand({ category: 'fleet', amount: Number.MAX_SAFE_INTEGER, rate: 1 });
  assert.equal(result.total, Number.MAX_SAFE_INTEGER);
});
