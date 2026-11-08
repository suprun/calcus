const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({});
['norms.js', 'calculations.js'].forEach(file => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context));
const calc = context.PreschoolCalc;
const draft = overrides => Object.assign(calc.createDraft(), overrides);
const group = (id, count, age = 'older') => ({ id: String(id), count: String(count), age });
const full = overrides => draft({ capacity: '80', footprint: '600', groups: [group(1, 20, 'under3'), group(2, 20), group(3, 20), group(4, 20)], ...overrides });
const area = (result, key) => result.areas.find(row => row.key === key);
const checks = (result, section) => result.checks.filter(row => row.section === section);

test('Ukrainian decimals, spaces, invalid and bounded integer input', () => {
  assert.equal(calc.number('1 234,5', 'Площа'), 1234.5);
  assert.equal(calc.number('0.25', 'Площа'), 0.25);
  ['', '-1', 'NaN', '1e3', 'Infinity', '1,2,3', '9007199254740993'].forEach(value => assert.throws(() => calc.number(value, 'Число')));
  assert.throws(() => calc.number('2,5', 'Дітей', { integer: true }));
  assert.equal(calc.optional('', 'Площа'), null);
});

test('site thresholds 40/41 and 80/81, 0.2 ha floor and special rate', () => {
  [[1, 2000], [40, 2000], [41, 1845], [80, 3600], [81, 3240]].forEach(([capacity, expected]) => {
    assert.equal(area(calc.evaluate(draft({ capacity: String(capacity) })), 'site').norm, expected);
  });
  assert.equal(area(calc.evaluate(draft({ kind: 'special', capacity: '24' })), 'site').norm, 1440);
});

test('only one eligible, explicitly confirmed land reduction applies', () => {
  const d = full({ construction: 'reconstruction', dense: true, reduction: 'dense' });
  assert.equal(calc.evaluate(d).site, 3600);
  d.reductionConfirmed = true;
  assert.equal(calc.evaluate(d).site, 2880);
  d.reduction = 'slope'; d.slope = '20';
  assert.equal(calc.evaluate(d).site, 3600);
  d.slope = '20,01';
  assert.equal(calc.evaluate(d).site, 3060);
  d.reduction = 'built'; d.placement = 'residential';
  assert.equal(calc.evaluate(d).site, 3240);
  d.kind = 'special';
  assert.equal(calc.evaluate(d).site, 4800);
});

test('main dependency chain yields hand-calculated territory balance', () => {
  const r = calc.evaluate(full());
  assert.equal(r.site, 3600);
  assert.equal(area(r, 'group-1').norm, 150);
  assert.equal(area(r, 'shade-1').norm, 40);
  assert.equal(area(r, 'sport-all').norm, 270);
  assert.equal(area(r, 'household').norm, 100);
  assert.equal(r.green.minimum, 900);
  assert.equal(r.balance.used, 2630);
  assert.equal(r.balance.remaining, 970);
  assert.equal(r.buildingPercent, 16.666667);
});

test('manual accepted values persist while automatic norms follow capacity and groups', () => {
  const d = full();
  d.overrides.site = '4000'; d.overrides['group-1'] = '180';
  d.capacity = '100'; d.groups[0].count = '40';
  let r = calc.evaluate(d);
  assert.equal(area(r, 'site').norm, 4000);
  assert.equal(area(r, 'group-1').norm, 300);
  assert.equal(area(r, 'group-1').actual, 180);
  assert.equal(area(r, 'group-1').status, 'fail');
  assert.equal(r.green.minimum, 1000);
  delete d.overrides['group-1'];
  r = calc.evaluate(d);
  assert.equal(area(r, 'group-1').actual, 300);
});

test('incomplete or invalid groups clear dependent totals, preserving independent branches', () => {
  const d = full(); d.groups[0].count = '19';
  let r = calc.evaluate(d);
  assert.equal(r.groupDifference, -1);
  assert.equal(r.balance, null);
  assert.equal(area(r, 'group-1').status, 'incomplete');
  assert.equal(r.site, 3600);
  assert.equal(area(r, 'household').actual, 100);
  d.groups[0].count = 'invalid'; r = calc.evaluate(d);
  assert.equal(r.groupTotal, null);
  assert.equal(r.balance, null);
  assert.equal(area(r, 'sport-all').norm, null);
});

test('small 40/41 and special 24/25 switch applicable area families', () => {
  [[40, 'garden', true], [41, 'garden', false], [24, 'special', true], [25, 'special', false]].forEach(([capacity, kind, small]) => {
    const r = calc.evaluate(draft({ capacity: String(capacity), kind, groups: [group(1, capacity)] }));
    assert.equal(r.small, small);
    assert.equal(!!area(r, 'small-shared'), small);
    assert.equal(!!area(r, 'group-1'), !small);
  });
});

test('small playground dense rate and universal special playground', () => {
  let r = calc.evaluate(draft({ capacity: '30', dense: true, compactSmall: true }));
  assert.equal(area(r, 'small-shared').norm, 210);
  r = calc.evaluate(draft({ capacity: '24', kind: 'special', dense: true, compactSmall: true }));
  assert.equal(area(r, 'small-shared').norm, 720);
  assert.equal(r.areas.some(row => row.key.startsWith('shade-')), false);
});

test('separate small playgrounds require complete groups; shared mode does not', () => {
  const d = draft({ capacity: '30', footprint: '200' });
  assert.ok(calc.evaluate(d).balance);
  d.separateSmall = true;
  assert.equal(calc.evaluate(d).balance, null);
  d.groups = [group(1, 15), group(2, 15)];
  assert.equal(area(calc.evaluate(d), 'small-1').norm, 150);
  assert.ok(calc.evaluate(d).balance);
});

test('sports area uses simultaneous group size, not total institution capacity', () => {
  const d = full({ capacity: '160', groups: [group(1, 40, 'under3'), group(2, 60), group(3, 60)] });
  assert.equal(area(calc.evaluate(d), 'sport-all').norm, 810);
  d.capacity = '161'; d.groups[2].count = '61';
  const r = calc.evaluate(d);
  assert.equal(area(r, 'sport-young').norm, 540);
  assert.equal(area(r, 'sport-older').norm, 823.5);
  assert.equal(area(r, 'sport-all'), undefined);
});

test('special sports thresholds 90/91 and nursery single sports ground', () => {
  const d = full({ kind: 'special', capacity: '90', groups: [group(1, 40, 'three'), group(2, 50)] });
  assert.equal(area(calc.evaluate(d), 'sport-all').norm, 1000);
  d.capacity = '91'; d.groups[1].count = '51';
  assert.equal(area(calc.evaluate(d), 'sport-older').norm, 1020);
  assert.equal(area(calc.evaluate(d), 'shade-1').norm, 30);
  const r = calc.evaluate(full({ kind: 'nursery', capacity: '161', groups: [group(1, 80, 'under3'), group(2, 81, 'under3')] }));
  assert.ok(area(r, 'sport-all'));
  assert.equal(area(r, 'sport-young'), undefined);
});

test('mixed groups cannot silently be assigned to two age-specific sports grounds', () => {
  const r = calc.evaluate(full({ capacity: '161', groups: [group(1, 80, 'mixed'), group(2, 81)] }));
  assert.equal(area(r, 'sport-young').norm, null);
  assert.equal(r.balance, null);
});

test('mini stadium excludes replaced sports areas and dormant manual values return', () => {
  const d = full({ capacity: '161', groups: [group(1, 80, 'under3'), group(2, 81)], stadium: true });
  d.overrides['sport-older'] = '1200';
  assert.equal(area(calc.evaluate(d), 'stadium').norm, 400);
  assert.equal(area(calc.evaluate(d), 'sport-older'), undefined);
  d.stadium = false;
  assert.equal(area(calc.evaluate(d), 'sport-older').actual, 1200);
  d.capacity = '40'; d.groups = [];
  assert.equal(area(calc.evaluate(d), 'sport-older'), undefined);
  assert.equal(d.overrides['sport-older'], '1200');
});

test('household area thresholds 40/41 and 120/121', () => {
  [[40, 70], [41, 100], [120, 100], [121, 150]].forEach(([capacity, expected]) => {
    assert.equal(area(calc.evaluate(draft({ capacity: String(capacity) })), 'household').norm, expected);
  });
});

test('embedded greenery is not added twice to the land balance', () => {
  const d = full(); d.greenParts['group-1'] = '150';
  const r = calc.evaluate(d);
  assert.equal(r.green.embedded, 150);
  assert.equal(r.green.free, 750);
  assert.equal(r.green.total, 900);
  assert.equal(r.balance.used, 2480);
  d.greenParts['group-1'] = '151';
  assert.equal(calc.evaluate(d).balance, null);
});

test('roof playgrounds leave the land balance and rooftop greenery remains separate', () => {
  const d = full(); d.locations['group-2'] = 'roof'; d.locations['shade-2'] = 'roof';
  d.roofArea = '500'; d.roofGreen = '100';
  const r = calc.evaluate(d);
  assert.equal(r.roofUsed, 190);
  assert.equal(r.balance.used, 2340);
  assert.equal(r.green.total, 900);
  assert.equal(r.green.free, 800);
  d.roofGreen = '501';
  assert.equal(calc.evaluate(d).green, null);
  assert.equal(calc.evaluate(d).balance, null);
});

test('roof age, height, fence gap and exits boundaries', () => {
  const d = full({ roofArea: '500', roofHeight: '5', roofFence: '1,6', roofGap: '0,1', roofExits: '2' });
  d.locations['group-1'] = 'roof';
  let r = calc.evaluate(d);
  assert.ok(checks(r, 'roof').some(row => row.label === 'Груповий майданчик 1' && row.status === 'fail'));
  assert.ok(checks(r, 'roof').some(row => row.label.includes('Просвіт') && row.status === 'fail'));
  d.roofHeight = '5.01'; d.roofGap = '0.099';
  r = calc.evaluate(d);
  assert.ok(checks(r, 'roof').some(row => row.label.includes('Висота розміщення') && row.status === 'fail'));
});

test('invalid accepted site, footprint and unrelated distance do not leave stale totals', () => {
  const d = full(); d.overrides.site = '0';
  assert.equal(calc.evaluate(d).site, null);
  assert.equal(area(calc.evaluate(d), 'site').actual, null);
  d.overrides.site = '3000'; d.footprint = '';
  assert.equal(calc.evaluate(d).balance, null);
  d.footprint = '600'; d.redline = 'oops';
  assert.ok(calc.evaluate(d).balance);
  assert.ok(calc.evaluate(d).errors.some(row => row.section === 'distances'));
});

test('oversubscribed site yields a negative remainder without hiding the deficit', () => {
  const d = full(); d.overrides.site = '1000';
  const r = calc.evaluate(d);
  assert.ok(r.balance.remaining < 0);
  assert.ok(checks(r, 'balance').some(row => row.status === 'fail'));
});

test('optional zones leave the balance when deselected, preserving their input', () => {
  const d = full({ events: true }); d.overrides.events = '75';
  let r = calc.evaluate(d);
  assert.equal(area(r, 'events').actual, 75);
  const used = r.balance.used;
  d.events = false; r = calc.evaluate(d);
  assert.equal(area(r, 'events'), undefined);
  assert.equal(r.balance.used, used - 75);
  assert.equal(d.overrides.events, '75');
});

test('ecological area uses children from age four and project-only areas require entry', () => {
  const d = full({ ecology: true, orientation: true, kind: 'special' });
  let r = calc.evaluate(d);
  assert.equal(area(r, 'ecology').norm, 45);
  assert.equal(area(r, 'orientation').actual, null);
  d.overrides.orientation = '80'; r = calc.evaluate(d);
  assert.equal(area(r, 'orientation').status, 'project');
});

test('fire, reconstruction distance and placement capacity checks', () => {
  const d = full({ construction: 'reconstruction', serviceDistance: '20', redline: '24', fireWidth: '3,5', fence: '1,6' });
  let r = calc.evaluate(d);
  assert.ok(checks(r, 'distances').some(row => row.label.includes('контейнерного') && row.status === 'pass'));
  assert.ok(checks(r, 'distances').some(row => row.label.includes('червоної') && row.status === 'fail'));
  d.capacity = '121'; d.placement = 'residential';
  r = calc.evaluate(d);
  assert.ok(checks(r, 'building').some(row => row.label.includes('Місткість') && row.status === 'fail'));
});

test('third floor never becomes a full pass from fire radius alone', () => {
  const d = full({ floors: '3', fireLadder: 'yes', fireRadius: '3' });
  assert.equal(checks(calc.evaluate(d), 'building').find(row => row.label.includes('Поверховість')).status, 'review');
  d.seismic = true;
  assert.equal(checks(calc.evaluate(d), 'building').find(row => row.label.includes('Поверховість')).status, 'fail');
});

test('ramp length, flights, width, slope and invalid input', () => {
  const d = full({ access: true, ramp: true, rampRise: '0,9', rampSlope: '5', rampWidth: '1,2', construction: 'reconstruction' });
  let r = calc.evaluate(d);
  assert.equal(r.ramp.length, 18);
  assert.equal(r.ramp.flights, 2);
  assert.equal(r.ramp.intermediate, 1);
  d.rampSlope = '8.01'; r = calc.evaluate(d);
  assert.ok(checks(r, 'access').some(row => row.label.includes('Ухил і довжина') && row.status === 'fail'));
  d.rampSlope = '0';
  assert.equal(calc.evaluate(d).ramp, null);
  assert.ok(calc.evaluate(d).balance);
});

test('ambiguous provisions and unavailable new-ramp appendix never produce a pass', () => {
  const d = full({ kind: 'special', capacity: '24', dropoff: false, access: true, stairs: true, riser: '0.13', ramp: true, rampRise: '0.2' });
  const r = calc.evaluate(d);
  assert.equal(checks(r, 'dropoff')[0].status, 'review');
  assert.equal(checks(r, 'access').find(row => row.label === 'Висота сходинки').status, 'review');
  assert.equal(checks(r, 'access').find(row => row.label.includes('Ухил і довжина')).status, 'review');
});

test('report uses current evaluation, sources, errors and protects spreadsheet formulas', () => {
  const d = full({ name: '=HYPERLINK("test")' });
  const first = calc.csv(calc.reportRows(d, calc.evaluate(d)));
  assert.ok(first.startsWith('\uFEFF'));
  assert.ok(first.includes("'=HYPERLINK"));
  assert.ok(calc.csv([[-12.5, '+SUM(A1)', 'a"b']]).includes('"-12,5";"\'+SUM(A1)";"a""b"'));
  d.overrides.site = 'oops';
  const rows = calc.reportRows(d, calc.evaluate(d));
  assert.ok(rows.some(row => row[0] === 'Вихідні дані' && row[4] === 'Помилка введення'));
  assert.ok(rows.some(row => String(row[5]).includes('DBN6.pdf')));
});
