(() => {
  'use strict';

  const norms = globalThis.ParkingNorms;
  const garageTypes = ['above', 'combined', 'underground'];
  const statusLabels = {
    calculated: 'Розраховано', pass: 'Відповідає цьому показнику',
    fail: 'Менше мінімуму', review: 'Потребує уточнення',
    individual: 'Потрібне індивідуальне визначення',
    approval: 'Потрібне погодження за ДСП', electric: 'Окреме визначення для авто без ДВЗ',
    notApplicable: 'Не застосовується',
  };
  function number(raw, label, options = {}) {
    const text = String(raw ?? '').trim().replace(/\s/g, '').replace(',', '.');
    const pattern = options.signed ? /^-?\d+(?:\.\d+)?$/ : /^\d+(?:\.\d+)?$/;
    const value = pattern.test(text) ? Number(text) : NaN;
    const min = options.min ?? 0;
    const max = options.max ?? Number.MAX_SAFE_INTEGER;
    if (!Number.isFinite(value) || value < min || value > max
      || (options.integer && !Number.isSafeInteger(value))) {
      throw new Error(label + ': введіть ' + (options.integer ? 'ціле ' : '')
        + (min === Number.MIN_VALUE ? 'число більше нуля' : 'число від ' + min)
        + (max < Number.MAX_SAFE_INTEGER ? ' до ' + max : '') + '.');
    }
    return value;
  }
  function optionalNumber(raw, label, options = {}) {
    return raw === '' || raw === null || raw === undefined ? null : number(raw, label, options);
  }
  function safe(value) {
    if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
      throw new Error('Значення завелике для точного розрахунку.');
    }
    return value;
  }
  const epsilon = value => Math.min(1e-9, Number.EPSILON * Math.max(1, Math.abs(value)) * 4);
  const ceil = value => Math.ceil(safe(value) - epsilon(value));
  const floor = value => Math.floor(safe(value) + epsilon(value));
  const metric = (label, value, unit, rule, note = '', status = 'calculated') => (
    { label, value, unit, rule, note, status }
  );
  function check(label, minimum, actual, unit, rule, note = '', unresolved = false) {
    let status = unresolved ? 'review' : 'calculated';
    if (actual !== null) {
      if (actual + epsilon(actual) < minimum) status = 'fail';
      else if (!unresolved) status = 'pass';
    }
    return { ...metric(label, minimum, unit, rule, note, status), actual };
  }
  function scenario(input) {
    const capacity = number(input.capacity, 'Місткість', { min: 1, integer: true });
    const ev = number(input.ev, 'Місця лише для електромобілів без ДВЗ', { integer: true, max: capacity });
    if (!['open', ...garageTypes].includes(input.type)) throw new Error('Оберіть тип споруди.');
    if (!['permanent', 'temporary'].includes(input.purpose)) throw new Error('Оберіть спосіб зберігання.');
    if (!['residential', 'public', 'industrial', 'utilities', 'warehouse', 'other', 'unknown'].includes(input.zone)) {
      throw new Error('Оберіть тип території.');
    }
    const fire = input.fire || 'unknown';
    if (!['I', 'II', 'III', 'IIIa', 'IIIb', 'IV', 'IVa', 'V', 'unknown'].includes(fire)) {
      throw new Error('Оберіть ступінь вогнестійкості.');
    }
    return { ...input, capacity, ev, fire, ice: capacity - ev };
  }
  function capacityAndType(input) {
    const capacity = number(input.capacity, 'Місткість', { min: 1, integer: true });
    if (!['open', ...garageTypes].includes(input.type)) throw new Error('Оберіть тип споруди.');
    return { capacity, type: input.type };
  }
  function storagePurpose(value) {
    if (!['permanent', 'temporary'].includes(value)) throw new Error('Оберіть спосіб зберігання.');
    return value;
  }
  function sanitaryScenario(input) {
    const main = capacityAndType(input);
    const ev = number(input.ev, 'Місця лише для електромобілів без ДВЗ', { integer: true, max: main.capacity });
    const fire = input.fire || 'unknown';
    if (!['I', 'II', 'III', 'IIIa', 'IIIb', 'IV', 'IVa', 'V', 'unknown'].includes(fire)) {
      throw new Error('Оберіть ступінь вогнестійкості.');
    }
    return { ...main, ev, fire, ice: main.capacity - ev };
  }
  function areas(input) {
    const value = number(input.value, 'Значення', { min: Number.MIN_VALUE, integer: input.mode === 'places' });
    if (!['places', 'build', 'site'].includes(input.mode)) throw new Error('Оберіть режим площі.');
    const isOpen = input.type === 'open';
    if (!isOpen && !garageTypes.includes(input.type)) throw new Error('Оберіть тип споруди.');
    if (isOpen && input.mode === 'build') throw new Error('Для відкритої стоянки площа забудови не застосовується; оберіть площу ділянки.');
    const selected = isOpen ? [{ id: 'open', label: 'Відкрита стоянка', build: null, site: 25 }]
      : norms.floors.filter(row => input.floors.includes(row.id));
    if (!selected.length) throw new Error('Оберіть хоча б один варіант поверховості.');
    return selected.map(row => {
      if (input.type === 'underground' && ['6', '7-9'].includes(row.id)) {
        return { ...row, unavailable: true, note: 'П. 6.1: звичайний підземний гараж — не більше 5 поверхів; автоматизовані гаражі не розраховуються.' };
      }
      const rate = input.mode === 'build' ? row.build : row.site;
      const theoretical = input.mode === 'places' ? value : safe(value / rate);
      const capacity = floor(theoretical);
      return {
        ...row, theoretical, capacity,
        buildArea: row.build === null ? null : safe(capacity * row.build),
        siteArea: safe(capacity * row.site),
        remaining: input.mode === 'places' ? null : Math.max(0, safe(value - capacity * rate)),
        inputMode: input.mode, inputValue: value, type: input.type,
        rule: 'ДБН В.2.3-15, п. 4.6, табл. 1',
      };
    });
  }
  function demand(input) {
    const housing = input.category === 'housing';
    const record = housing ? norms.housing[input.housing] : norms.demand.find(row => row.id === input.category);
    if (!record) throw new Error('Оберіть категорію об’єкта.');
    const rule = housing ? 'ДБН Б.2.2-12, табл. 10.5, прим. 1'
      : 'ДБН Б.2.2-12, ' + (record.industrial ? (record.id === 'fleet' ? 'п. 10.8.12' : 'табл. 10.8') : 'табл. 10.7');
    const amount = number(input.amount, housing ? 'Однокімнатних квартир' : record.unit, {
      integer: housing || !record.area,
    });
    const second = housing ? number(input.second, 'Квартир із двома й більше кімнатами', { integer: true }) : 0;
    const quantity = housing ? amount * 0.5 + second : amount;
    if (!quantity) throw new Error('Розрахункова кількість має бути більшою за нуль.');
    const range = housing ? [record.rate, record.rate] : record.range;
    const rate = housing ? record.rate : number(input.rate, 'Прийнята ставка', { min: range[0], max: range[1] });
    if (record.area && (amount < record.area[0] || (record.exclusiveMin && amount <= record.area[0])
      || (record.area[1] !== null && amount > record.area[1]))) {
      throw new Error('Торгова площа не належить обраній категорії; змініть рядок таблиці.');
    }
    if (record.id === 'business' && input.businessType !== 'social'
      && number(input.businessArea, 'Площа ділового об’єкта', { min: Number.MIN_VALUE }) <= 100) {
      throw new Error('Цей рядок для ділових об’єктів застосовується лише до площі понад 100 м².');
    }
    const correction = input.correction || 'none';
    let percent = 0;
    const notes = [];
    if (correction !== 'none') {
      if (!input.confirmed || !String(input.basis || '').trim()) {
        throw new Error('Для коригування підтвердьте умови та вкажіть документ / обґрунтування.');
      }
      if (correction === 'residential') {
        if (!housing) throw new Error('Зменшення за ДПТ застосовується до житла.');
        percent = -number(input.percent, 'Зменшення за ДПТ, %', { max: 20 });
        notes.push('Умови п. 10.8.1 підтверджено користувачем: ' + input.basis);
      } else if (correction === 'local') {
        if (housing || record.industrial) throw new Error('Коригування ±20% передбачене приміткою 4 до табл. 10.7.');
        percent = number(input.percent, 'Коригування, %', { signed: true, min: -20, max: 20 });
        notes.push('Табл. 10.7, прим. 4; обґрунтування користувача: ' + input.basis);
      } else if (correction === 'park') {
        if (record.id !== 'park') throw new Error('Зменшення 50–70% застосовується лише до парків біля метро / швидкісного трамвая.');
        percent = -number(input.percent, 'Зменшення для парку, %', { min: 50, max: 70 });
        notes.push('Табл. 10.7, прим. 9; близькість станції й пішохідні підходи підтверджено користувачем: ' + input.basis);
      } else throw new Error('Невідомий вид коригування.');
    }
    const factor = 1 + percent / 100;
    const denominator = housing ? 1 : record.denominator || 100;
    const permanent = housing || record.id === 'fleet' ? ceil(quantity * rate / denominator * factor) : 0;
    const temporary = housing ? ceil(quantity * 0.15 * factor)
      : record.id === 'fleet' ? 0 : ceil(quantity * rate / denominator * factor);
    if (housing) notes.push('Однокімнатні квартири враховано з коефіцієнтом 0,5; гостьові місця — окремо за ставкою 0,15.');
    if (record.id === 'universityStaff' || record.id === 'universityStudents') {
      notes.push('Для закладу освіти додайте обидві складові: персонал і студенти.');
    }
    if (record.area && [500, 2000].includes(amount)) {
      notes.push('На цій межі суміжні рядки табл. 10.7 перетинаються; прийнятий рядок потребує уточнення в завданні на проєктування.');
    }
    if (!housing && !record.industrial) {
      notes.push('Табл. 10.7, прим. 1: нижня межа відповідає низькому рівню автомобілізації, верхня — високому; автоматичної інтерполяції ставок немає.');
    }
    return {
      label: input.name || record.label, category: input.category, quantity, amount, second,
      unit: housing ? 'приведених квартир' : record.unit,
      rate, range, permanent, temporary, total: safe(permanent + temporary), percent,
      min: housing ? permanent + temporary : ceil(quantity * range[0] / denominator * factor),
      max: housing ? permanent + temporary : ceil(quantity * range[1] / denominator * factor),
      formula: housing
        ? 'Постійні: округлити вгору((' + amount + ' × 0,5 + ' + second + ') × ' + rate
          + ' × ' + factor + '); гостьові: округлити вгору((' + amount + ' × 0,5 + ' + second + ') × 0,15 × ' + factor + ')'
        : quantity + ' / ' + denominator + ' × ' + rate + ' × ' + factor,
      rule, notes, review: Boolean(record.area && [500, 2000].includes(amount)),
    };
  }
  function mixedDemand(rows) {
    return rows.reduce((sum, row) => ({
      permanent: safe(sum.permanent + row.permanent),
      temporary: safe(sum.temporary + row.temporary),
      total: safe(sum.total + row.total), review: sum.review || row.review,
    }), { permanent: 0, temporary: 0, total: 0, review: false });
  }
  const binFor = count => (count <= 10 ? 0 : count <= 50 ? 1 : count <= 100 ? 2 : count <= 300 ? 3 : 4);
  function sanitary(current, input) {
    const main = sanitaryScenario(current);
    const neighbors = (input.neighbors || []).map((row, index) => ({
      ...sanitaryScenario({ ...main, ...row }), distance: number(row.distance, 'Відстань до сусідньої стоянки ' + (index + 1)),
    })).filter(row => row.distance < 6);
    const all = [main, ...neighbors];
    const count = safe(all.reduce((total, row) => total + row.ice, 0));
    const bin = binFor(count);
    const isGarage = main.type !== 'open';
    const allGarages = all.every(row => row.type !== 'open' && row.type !== 'underground');
    const unknownFire = all.some(row => row.type !== 'open' && (!row.fire || row.fire === 'unknown'));
    const method = input.method || 'table';
    if (!['table', 'interpolate', 'reduce'].includes(method)) throw new Error('Оберіть метод санітарного розрахунку.');
    if (method === 'reduce' && (!isGarage || main.type === 'underground'
      || !['I', 'II'].includes(main.fire) || input.noWindows !== 'yes' || input.noEntrances !== 'yes'
      || neighbors.length)) {
      throw new Error('−25%: лише окремий надземний / наземно-підземний гараж I–II ступеня, без вікон, які відчиняються, і в’їздів у бік будівель. Умови групи гаражів тут не підтверджуються.');
    }
    if (method === 'interpolate' && !allGarages) {
      throw new Error('Інтерполяція призначена для гаражів; для відкритої або змішаної групи оберіть табличний метод.');
    }
    const actual = optionalNumber(input.actual, 'Фактична відстань');
    const results = norms.sanitary.map(row => {
      const rule = 'ДСП №173, дод. 10; ДБН Б.2.2-12, п. 10.8.8, табл. 10.6';
      if (all.some(item => item.type === 'underground')) {
        return metric(row.label, null, 'м', rule, 'Таблиця не визначає відстань для повністю підземного гаража; окремо перевіряються в’їзди, вентиляція та інші вимоги.', 'notApplicable');
      }
      if (!count) return metric(row.label, null, 'м', rule, 'У групі немає місць для авто з ДВЗ. Нульова СЗЗ автоматично не встановлюється.', 'electric');
      if (row.values[bin] === null) return metric(row.label, null, 'м', rule, 'Числового значення немає. За виноскою дод. 10 ДСП потрібне погодження з центральним органом виконавчої влади, що реалізує політику у сфері санітарного законодавства.', 'approval');
      const corrected = row.values.map((value, index) => {
        const minimum12 = all.some(item => item.type !== 'open'
          && ((['III', 'IV'].includes(item.fire) && row.stars.includes(index))
          || (['III', 'IIIa', 'IIIb', 'IV', 'IVa'].includes(item.fire) && (row.dbnStars || row.stars).includes(index))));
        return value !== null && minimum12 ? Math.max(12, value) : value;
      });
      let value = corrected[bin];
      const notes = ['Розрахункова місткість для відстаней: ' + count + ' місць для ДВЗ.'];
      let uncertain = unknownFire && row.stars.includes(bin);
      if (method === 'interpolate' && count > 10 && count <= 300) {
        const points = [10, 50, 100, 300];
        const upper = points.findIndex(point => count <= point);
        const lower = upper - 1;
        if (corrected[lower] === null || corrected[upper] === null) {
          return metric(row.label, null, 'м', rule, 'Інтерполяція через клітинку без числового значення не виконується; за виноскою дод. 10 ДСП потрібне погодження уповноваженого центрального органу.', 'approval');
        }
        value = corrected[lower] + (count - points[lower])
          * (corrected[upper] - corrected[lower]) / (points[upper] - points[lower]);
        uncertain ||= unknownFire && (row.stars.includes(lower) || row.stars.includes(upper));
        notes.push('Інтерполяція між ' + points[lower] + ' і ' + points[upper] + ' місцями, прим. 4 дод. 10.');
      } else if (method === 'interpolate') {
        notes.push('Поза інтервалом 10–300 використано табличне значення; екстраполяції немає.');
      }
      if (method === 'reduce') {
        value *= 0.75;
        notes.push('Табличне значення × 0,75, прим. 3 дод. 10; умови підтверджено користувачем.');
      }
      if (row.id === 'housing' && all.some(item => item.type === 'open') && count >= 101 && count <= 300
        && input.sectional === 'yes') {
        value = Math.max(value, 50);
        notes.push('Відкрита стоянка вздовж поздовжнього фасаду секційного житлового будинку: не менше 50 м.');
      }
      if (row.id === 'housing' && all.some(item => item.type === 'open') && count >= 101 && count <= 300
        && input.sectional === 'unknown') {
        uncertain = true;
        notes.push('Уточніть розташування щодо поздовжнього фасаду секційного будинку: може бути потрібний мінімум 50 м.');
      }
      if (uncertain && unknownFire) notes.push('Не визначена вогнестійкість гаража: для позначених клітинок можливий мінімум 12 м.');
      if (neighbors.length) notes.push('Додано ' + neighbors.length + ' сусідніх стоянок ближче 6 м; на межі 6 м сумування немає.');
      const rounded = ceil(value * 10) / 10;
      if (Math.abs(rounded - value) > 1e-9) notes.push('Прийняте значення округлено вгору до 0,1 м.');
      const selectedActual = input.target === row.id ? actual : null;
      return check(row.label, rounded, selectedActual, 'м', rule, notes.join(' '), uncertain);
    });
    return { count, neighbors: neighbors.length, metrics: results, notes: [
      'Вимірювання: від вікон житлових/громадських будівель або меж ділянок закладів освіти та стаціонарів до стін гаража / меж стоянки.',
      'Порівняння стосується лише вибраного табличного показника; не замінює встановлення СЗЗ та оцінку шуму й викидів.',
    ] };
  }
  function accessible(current, input) {
    const s = { ...capacityAndType(current), purpose: storagePurpose(current.purpose) };
    const rows = [];
    const noteRule = 'ДБН Б.2.2-12, табл. 10.7, прим. 2';
    const inclusiveApplies = s.type === 'open' && ['service', 'ambulatory'].includes(input.context);
    const planningApplies = s.purpose === 'permanent' || input.context === 'ambulatory'
      || (s.type === 'open' && input.context === 'service');
    let planningMinimum = null;
    let review = s.type === 'open' && input.context === 'general';
    if (planningApplies) {
      if (input.context === 'ambulatory') {
        const rate = number(input.medicalRate, 'Частка доступних місць, %', { min: 10, max: 15 });
        planningMinimum = ceil(s.capacity * rate / 100);
        rows.push(metric('Доступні місця: амбулаторне лікування', planningMinimum, 'місць', noteRule, 'Норма 10–15%; прийнято ' + rate + '%.'));
      } else if (s.capacity < 100) {
        planningMinimum = 4;
        rows.push(metric('Доступні місця за табл. 10.7', 4, 'місця', noteRule));
      } else if (s.capacity === 100) {
        planningMinimum = number(input.accessibleCount, 'Прийнята кількість доступних місць', { min: 4, max: 7, integer: true });
        review ||= planningMinimum < 7;
        rows.push(metric('Доступні місця на межі 100 автомобілів', planningMinimum, 'місць', noteRule,
          'У тексті перетинаються «до 100» і «від 100 до 200». Обрано ' + planningMinimum + '; 7 задовольняє обидва табличні обмеження.', review ? 'review' : 'calculated'));
      } else if (s.capacity <= 200) {
        planningMinimum = number(input.accessibleCount, 'Прийнята кількість доступних місць', { min: 5, max: 7, integer: true });
        rows.push(metric('Доступні місця за табл. 10.7', planningMinimum, 'місць', noteRule, 'Діапазон 5–7; автоматичної інтерполяції немає.'));
      } else {
        review = true;
        rows.push(metric('Доступні місця за табл. 10.7', null, 'місць', noteRule, 'Понад 200 автомобілів — за розрахунком.', 'individual'));
      }
    } else {
      review = true;
      rows.push(metric('Доступні місця за табл. 10.7', null, 'місць', noteRule,
        'Уточніть функціональне призначення об’єкта та застосовність вимоги.', 'review'));
    }
    const inclusiveMinimum = inclusiveApplies ? Math.max(1, ceil(s.capacity * 0.1)) : null;
    rows.push(metric('Доступні місця за нормами інклюзивності', inclusiveMinimum, 'місць', 'ДБН В.2.2-40, п. 5.4.1',
      inclusiveApplies ? '10%, але не менше одного: відкрита стоянка біля закладу обслуговування.'
        : 'Правило 10% цього пункту не поширюється автоматично на будь-який гараж / об’єкт.', inclusiveApplies ? 'calculated' : 'notApplicable'));
    const minimum = planningMinimum === null ? inclusiveMinimum : Math.max(planningMinimum, inclusiveMinimum || 0);
    if (s.capacity === 100 && inclusiveMinimum >= 7) review = false;
    const actual = optionalNumber(input.actualAccessible, 'Фактична кількість доступних місць', { integer: true, max: s.capacity });
    if (minimum !== null) {
      const row = check('Спільний визначений мінімум доступних місць', minimum, actual, 'місць', 'Застосовні вимоги табл. 10.7 та п. 5.4.1',
        minimum > s.capacity ? 'Мінімум перевищує загальну місткість: потрібне коригування рішення.'
          : review ? 'Не всі застосовні умови визначені; це умовний мінімум, а не підтвердження відповідності.' : '', review);
      if (minimum > s.capacity) row.status = 'fail';
      rows.push(row);
    } else rows.push(metric('Спільний мінімум доступних місць', null, 'місць', noteRule, 'Немає достатніх даних для визначеного спільного мінімуму.', 'individual'));
    rows.push(inclusiveApplies ? check('Ширина доступного паркувального місця', 3.5,
      optionalNumber(input.accessibleWidth, 'Ширина доступного місця'), 'м', 'ДБН В.2.2-40, п. 5.4.1',
      'Для відкритої стоянки біля закладу обслуговування; потрібний безбар’єрний доступ.')
      : metric('Ширина доступного паркувального місця', null, 'м', 'ДБН В.2.2-40, п. 5.4.1',
        'Застосовність цього пункту до обраного об’єкта не встановлена; потрібне окреме проєктне рішення.', 'review'));
    rows.push(metric('Рекомендована відстань доступного місця до входу', 50, 'м, не більше', 'ДБН В.2.2-40, п. 5.4.1',
      'Для житлових і громадських об’єктів також перевіряється п. 10.8.4 ДБН Б.2.2-12.'));
    return { metrics: rows, notes: [
      'Спеціальні місця входять до загальної місткості; відсотки не додаються до неї. Суміщення функцій одного місця потребує проєктного рішення.',
    ] };
  }
  function electric(current, input) {
    const s = capacityAndType(current);
    if (!['residential', 'public', 'industrial', 'utilities', 'warehouse', 'other', 'unknown'].includes(current.zone)) {
      throw new Error('Оберіть тип території.');
    }
    s.zone = current.zone;
    const rows = [];
    const evMinimum = ceil(s.capacity * 0.05);
    rows.push(check('Місця для електромобілів', evMinimum,
      optionalNumber(input.actualEv, 'Фактичні місця для електромобілів', { integer: true, max: s.capacity }), 'місць', 'ДБН В.2.3-15, п. 4.12', 'Не менше 5% загальної місткості; місце не тотожне зарядній точці.'));
    const chargingApplies = !['other', 'unknown'].includes(s.zone);
    const charging = chargingApplies ? ceil(s.capacity * 0.1) : null;
    if (chargingApplies) rows.push(check('Точки зарядки звичайної потужності', charging,
      optionalNumber(input.actualCharging, 'Фактичні точки зарядки', { integer: true }), 'точок', 'ДБН Б.2.2-12, п. 10.8.34',
      '10% загальної кількості місць; передбачити резерв потужності / додаткові точки. Це окрема вимога, не заміна норми 5%.'));
    else rows.push(metric('Точки зарядки звичайної потужності', null, 'точок', 'ДБН Б.2.2-12, п. 10.8.34', 'Для цієї / невідомої зони застосовність потребує уточнення.', 'review'));
    return { metrics: rows, notes: [
      'Спеціальні місця входять до загальної місткості; відсотки не додаються до неї. Суміщення функцій одного місця потребує проєктного рішення.',
      'П. 4.12: зарядки в підземному гаражі — лише на першому підземному поверсі; групи зарядних місць у гаражах відокремлюються з трьох боків перегородками ЕІ 45.',
      'Перевірка пожежного захисту зарядок, зокрема за ДСТУ 9222:2023, виходить за межі цього калькулятора.',
    ] };
  }
  function special(current, input) {
    const s = scenario(current);
    const access = accessible(s, input);
    const charging = electric(s, { ...input, actualEv: s.ev });
    return { metrics: [...access.metrics, ...charging.metrics], notes: [...new Set([...access.notes, ...charging.notes])] };
  }
  function dimensions(current, input) {
    if (!['open', ...garageTypes].includes(current.type)) throw new Error('Оберіть тип споруди.');
    const s = { type: current.type, purpose: current.type === 'open' ? storagePurpose(current.purpose) : null };
    const rows = [];
    if (s.type === 'open') {
      if (!['one', 'two'].includes(input.traffic)) throw new Error('Оберіть напрямок руху в проїзді.');
      if (input.compact && s.purpose !== 'temporary') throw new Error('Зменшені габарити 2,3 × 5,0 м допустимі лише для тимчасових стоянок.');
      if (input.vehicle === 'medium') {
        rows.push(check('Ширина машиномісця', input.compact ? 2.3 : 2.5, optionalNumber(input.width, 'Ширина місця'), 'м', 'ДБН В.2.3-15, п. 5.2'));
        rows.push(check('Довжина машиномісця', input.compact ? 5 : 5.3, optionalNumber(input.length, 'Довжина місця'), 'м', 'ДБН В.2.3-15, п. 5.2', 'Для автомобілів середнього класу.'));
      } else rows.push(metric('Габарити машиномісця', null, 'м', 'ДБН В.2.3-15, п. 4.7, 5.2, дод. Г', 'Фіксовані 2,5 × 5,3 м не застосовуються автоматично до іншого класу; потрібні габарити автомобіля.', 'individual'));
      rows.push(check('Ширина проїзду', input.traffic === 'two' ? 6 : 3.5, optionalNumber(input.aisle, 'Ширина проїзду'), 'м', 'ДБН В.2.3-15, п. 5.2', 'Окремо перевіряються маневрування й організація руху.'));
      rows.push(check('Радіус заокруглення бортового каменю', 6, optionalNumber(input.radius, 'Радіус'), 'м', 'ДБН В.2.3-15, п. 5.2'));
    } else {
      const vehicle = norms.vehicleClasses.find(row => row.id === input.vehicle);
      const index = norms.aisleModes.findIndex(row => row.id === input.aisleMode);
      if (index < 0) throw new Error('Оберіть спосіб встановлення автомобіля.');
      if (!vehicle) rows.push(metric('Ширина внутрішнього проїзду', null, 'м', 'ДБН В.2.3-15, табл. Є.2', 'Для великого / іншого класу цей рядок не наведений; потрібне індивідуальне рішення.', 'individual'));
      else rows.push(check('Ширина внутрішнього проїзду', vehicle.aisles[index], optionalNumber(input.aisle, 'Ширина проїзду'), 'м', 'ДБН В.2.3-15, табл. Є.2', vehicle.label + '; ' + norms.aisleModes[index].label));
      rows.push(metric('Габарити місця зберігання в гаражі', null, 'м', 'ДБН В.2.3-15, п. 6.2, дод. Г, Є.1',
        'Визначаються габаритами автомобіля, розміщенням і захисними зонами. Параметри відкритої стоянки не підставляються автоматично.', 'individual'));
      const clearance = norms.clearances[number(input.clearance, 'Захисна зона', { integer: true, max: norms.clearances.length - 1 })];
      const minimum = clearance.storage;
      rows.push(minimum === null ? metric(clearance.label, null, 'м', 'ДБН В.2.3-15, табл. Є.1', 'Для місць зберігання у цій клітинці немає числового значення.', 'notApplicable')
        : check(clearance.label, minimum, optionalNumber(input.actualClearance, 'Фактична захисна зона'), 'м', 'ДБН В.2.3-15, табл. Є.1'));
    }
    return { metrics: rows, clearances: s.type === 'open' ? [] : norms.clearances, notes: [
      'Прим. табл. Є.1 дозволяє зменшення проїзду лише при збільшенні захисних зон; автоматично цей виняток не застосовано.',
      'Площі за табл. 1 вже враховують маневрову площу. Габаритна перевірка не є автоматичним компонуванням ділянки.',
    ] };
  }
  function entrances(current, input) {
    const s = { ...capacityAndType(current), purpose: storagePurpose(current.purpose) };
    const rows = [];
    if (s.type === 'open') {
      const emergency = s.capacity > 50 ? ceil(s.capacity / 200) : 0;
      rows.push(metric('Головний в’їзд-виїзд', 1, 'вузол', 'ДБН В.2.3-15, п. 5.5', s.capacity <= 50 ? 'Допускається об’єднаний в’їзд-виїзд завширшки не менше 4,5 м.' : 'Головний і аварійні виїзди мають бути розосереджені.'));
      rows.push(check('Аварійні виїзди', emergency, optionalNumber(input.emergency, 'Фактичні аварійні виїзди', { integer: true }), 'виїздів', 'ДБН В.2.3-15, п. 5.5'));
      if (s.capacity <= 50) rows.push(check('Ширина об’єднаного в’їзду-виїзду', 4.5, optionalNumber(input.entryWidth, 'Ширина об’єднаного в’їзду'), 'м', 'ДБН В.2.3-15, п. 5.5'));
      if (s.capacity >= 50) rows.push(metric('Контрольно-пропускний пункт', null, '', 'ДБН В.2.3-15, п. 5.9', 'Потрібний при місткості 50 і більше місць.'));
    } else {
      rows.push(metric('В’їзди та рампи гаража', null, '', 'ДБН В.2.3-15, розд. 6', 'Кількість і параметри залежать від планувального рішення; формула п. 5.5 для відкритих стоянок не підставляється.', 'individual'));
    }
    const accumulation = s.capacity > 300 ? ceil(s.capacity * (s.purpose === 'permanent' ? 0.005 : 0.01)) : null;
    rows.push(accumulation === null ? metric('Накопичувальний майданчик', null, 'авто', 'ДБН В.2.3-15, п. 4.8, 4.16', 'Цей числовий мінімум установлено для великої місткості: понад 300 місць.', 'notApplicable')
      : check('Місткість накопичувального майданчика', accumulation, optionalNumber(input.accumulation, 'Фактична місткість накопичувального майданчика', { integer: true }), 'авто', 'ДБН В.2.3-15, п. 4.16',
        (s.purpose === 'permanent' ? '0,5%' : '1%') + '; за завданням на проєктування може бути більшою.'));
    return { metrics: rows, notes: [
      'Відкриті стоянки: п. 5.4 передбачає однобічний рух; понад 100 місць — без зустрічних і перехресних потоків. Виняток — інтенсивність не більше 5 авто/год.',
      'П. 5.6, 5.8: відступ в’їзду від краю проїзної частини — не менше 6 м; від перехресть магістралей — 100 м, місцевих вулиць — 35 м, зони зупинки транспорту — 30 м.',
    ] };
  }
  function geometry(current, input) {
    const s = scenario(current);
    const sizes = dimensions(s, input);
    const entry = entrances(s, input);
    return { metrics: [...sizes.metrics, ...entry.metrics], clearances: sizes.clearances, notes: [...entry.notes, ...sizes.notes] };
  }
  function csv(rows) {
    const escape = value => {
      let text = typeof value === 'number' ? String(value).replace('.', ',') : String(value ?? '');
      if (typeof value !== 'number' && /^[=+\-@\t\r]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    };
    return '\uFEFF' + rows.map(row => row.map(escape).join(';')).join('\r\n');
  }
  globalThis.ParkingCalc = Object.freeze({
    number, optionalNumber, scenario, areas, demand, mixedDemand, sanitary, special, geometry,
    accessible, electric, dimensions, entrances, csv, statusLabels,
  });
})();
