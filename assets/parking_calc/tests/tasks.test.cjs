const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({});
['norms.js', 'calculations.js', 'tasks.js'].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
});
const model = context.ParkingTasks;
const calc = context.ParkingCalc;
const plain = value => JSON.parse(JSON.stringify(value));
const find = (result, label) => result.metrics.find(row => row.label.startsWith(label));

test('eight independent tasks initialize without shared scenario inputs', () => {
  const session = model.createSession();
  assert.equal(model.tasks.length, 8);
  model.tasks.forEach(task => {
    const result = session.calculate(task.id);
    assert.equal(result.task, task.id);
    assert(result.metrics.length > 0);
    assert(result.inputs.length > 0);
    assert(result.sources.length > 0);
    assert(!JSON.stringify(result).includes('NaN'));
  });
  assert.equal(session.report.length, 0);
  assert.equal(find(session.calculate('area'), 'Площа ділянки').value, 3000);
  assert.equal(find(session.calculate('area'), 'Площа забудови').value, 2500);
  assert(!session.calculate('dimensions').inputs.some(row => row.label.includes('Місткість')));
});

test('separate calculations require only their own meaningful parameters', () => {
  assert.equal(find(calc.accessible({ capacity: 100, type: 'above', purpose: 'permanent' },
    { context: 'general', accessibleCount: 7 }), 'Спільний').value, 7);
  const charging = calc.electric({ capacity: 101, type: 'above', zone: 'public' }, {});
  assert.equal(find(charging, 'Місця для електромобілів').value, 6);
  assert.equal(find(charging, 'Місця для електромобілів').actual, null);
  assert.equal(find(charging, 'Місця для електромобілів').status, 'calculated');
  assert.equal(find(charging, 'Точки зарядки').value, 11);
  assert.equal(find(calc.dimensions({ type: 'above' }, { vehicle: 'medium', aisleMode: 'rear90', clearance: 0 }), 'Ширина внутрішнього').value, 6.1);
  assert.equal(find(calc.entrances({ capacity: 301, type: 'open', purpose: 'permanent' }, {}), 'Місткість накопичувального').value, 2);
  assert.equal(calc.sanitary({ capacity: 100, type: 'above', ev: 0, fire: 'I' }, { target: 'housing', method: 'table' }).count, 100);
});

test('editing one draft never changes other tasks or calculates them implicitly', () => {
  const session = model.createSession();
  const before = plain(session.drafts);
  session.update('area', 'value', '64');
  session.update('area', 'floor', '3');
  session.calculate('area');
  for (const key of Object.keys(before).filter(key => key !== 'area')) assert.deepEqual(plain(session.drafts[key]), before[key]);
  session.update('electric', 'capacity', '');
  assert.throws(() => session.calculate('electric'));
  assert.equal(session.calculate('area').variants[0].capacity, 64);
});

test('area comparison and floor capacity preserve full places and remainders', () => {
  const session = model.createSession();
  Object.assign(session.drafts.capacity, { value: '900', floor: '3' });
  let result = session.calculate('capacity');
  assert.equal(result.metrics[0].value, 64);
  assert.equal(result.metrics[1].value, 4);
  Object.assign(session.drafts.capacity, { compare: true, floors: ['1', '3'] });
  result = session.calculate('capacity');
  assert.deepEqual(plain(result.variants.map(row => row.capacity)), [30, 64]);
  session.update('capacity', 'type', 'open');
  assert.equal(session.calculate('capacity').variants[0].siteArea, 900);
  Object.assign(session.drafts.capacity, { type: 'above', value: '0,1', compare: false });
  assert.equal(session.calculate('capacity').transfer.capacity, 0);
  assert.throws(() => session.transfer('sanitary', { capacity: 0 }, 'Порожня площа'));
  Object.assign(session.drafts.area, { type: 'underground', floor: '6' });
  assert(session.calculate('area').notes.some(note => note.includes('не більше 5')));
  assert.throws(() => session.add('area'));
});

test('explicit transfers change only named capacity/type and retain other destination settings', () => {
  const session = model.createSession();
  Object.assign(session.drafts.sanitary, { ev: '90', hasEv: true, fire: 'III', check: true, actual: '25' });
  const before = plain(session.drafts.sanitary);
  session.transfer('sanitary', { capacity: 64, type: 'open' }, 'Задача місткості: 64 місця');
  const expected = { ...before, capacity: '64', type: 'open', origin: 'Задача місткості: 64 місця' };
  assert.deepEqual(plain(session.drafts.sanitary), expected);
  assert.throws(() => session.calculate('sanitary')); // Existing EV count is not silently clamped.
  assert.equal(session.drafts.accessible.capacity, '100');
  session.transfer('area', { capacity: 64 }, 'Об’єкт');
  assert.equal(session.drafts.area.value, '64');
  assert.equal(session.drafts.area.floor, '1');
  session.update('area', 'value', '65');
  assert.equal(session.drafts.area.origin, undefined);
});

test('actual measurements are ignored until explicitly enabled and empty values stay unknown', () => {
  const session = model.createSession();
  session.update('electric', 'actualEv', 'abc');
  assert.equal(session.calculate('electric').metrics[0].actual, null);
  session.update('electric', 'check', true);
  assert.throws(() => session.calculate('electric'));
  session.update('electric', 'actualEv', '');
  assert.equal(session.calculate('electric').metrics[0].status, 'calculated');
  session.update('electric', 'actualEv', '0');
  assert.equal(session.calculate('electric').metrics[0].status, 'fail');
  Object.assign(session.drafts.dimensions, { type: 'open', purpose: 'temporary', compact: true, check: true, width: '2,3' });
  assert.equal(find(session.calculate('dimensions'), 'Ширина машиномісця').status, 'pass');
  session.update('dimensions', 'purpose', 'permanent');
  assert.equal(find(session.calculate('dimensions'), 'Ширина машиномісця').value, 2.5);
});

test('mixed object totals use saved components, not the uncommitted editor', () => {
  const session = model.createSession();
  const draft = session.drafts.demand;
  draft.components.push({ group: 'housing', category: 'housing', housing: 'central', amount: 0, second: 10, correction: 'none' });
  draft.components.push({ group: 'public', category: 'restaurant', amount: 100, rate: 10, correction: 'none' });
  Object.assign(draft, { amount: 'garbage', second: '' });
  const result = session.calculate('demand');
  assert.equal(result.metrics[0].value, 22);
  assert.equal(result.metrics[1].value, 10);
  assert.equal(result.metrics[2].value, 12);
  assert(!JSON.stringify(result.inputs).includes('garbage'));
});

test('report captures deep snapshots and preserves multiple variants through later edits or errors', () => {
  const session = model.createSession();
  const result = session.calculate('area');
  session.add('area', result);
  const first = JSON.stringify(session.report[0]);
  session.update('area', 'value', '200');
  session.add('area');
  session.drafts.area.floors.push('3');
  result.metrics[0].value = 123;
  assert.equal(JSON.stringify(session.report[0]), first);
  assert.equal(session.report.length, 2);
  assert.notEqual(session.report[0].id, session.report[1].id);
  session.update('area', 'value', '');
  assert.throws(() => session.add('area'));
  assert.equal(session.report.length, 2);
  session.remove(session.report[0].id);
  assert.equal(session.report.length, 1);
  assert.equal(session.report[0].metrics[0].value, 6000);
  session.clear();
  assert.equal(session.report.length, 0);
  assert.equal(model.createSession().report.length, 0);
});

test('exports include only added snapshots, their sources, formulas and unresolved conditions', () => {
  const session = model.createSession();
  session.update('sanitary', 'type', 'open');
  session.update('sanitary', 'capacity', '101');
  session.add('sanitary');
  session.update('demand', 'name', 'НЕ ДОДАНО ДО ЗВІТУ');
  session.update('sanitary', 'capacity', '250');
  const rows = model.reportRows(session.report);
  const text = JSON.stringify(rows);
  assert(!text.includes('НЕ ДОДАНО'));
  assert(text.includes('Потребує уточнення'));
  assert(text.includes('101 місць'));
  assert(text.includes('07.11.2026'));
  assert(text.includes('moz.gov.ua'));
  assert(text.includes('не є повною оцінкою'));
  const csv = calc.csv(rows);
  assert(csv.startsWith('\uFEFF'));
  assert(csv.includes('";"'));
});
