(() => {
  'use strict';

  const calc = globalThis.ParkingCalc;
  const norms = globalThis.ParkingNorms;
  const clone = value => JSON.parse(JSON.stringify(value));
  const types = { above: 'Надземний гараж', open: 'Відкрита стоянка', combined: 'Наземно-підземний гараж', underground: 'Підземний гараж' };
  const purposes = { permanent: 'Постійне зберігання', temporary: 'Тимчасове зберігання' };
  const zones = { residential: 'Житлова', public: 'Громадська', industrial: 'Промислова', utilities: 'Комунальна', warehouse: 'Складська', other: 'Інша', unknown: 'Не визначено' };
  const contexts = { general: 'Призначення не уточнено', other: 'Інший об’єкт', service: 'Заклад обслуговування', ambulatory: 'Амбулаторне лікування осіб з інвалідністю' };
  const methods = { table: 'Табличне значення', interpolate: 'Інтерполяція', reduce: 'Табличне значення −25%' };
  const yesNo = { yes: 'Так', no: 'Ні', unknown: 'Не визначено' };
  const tasks = [
    { id: 'area', title: 'Площа для заданої кількості авто', description: 'Вкажіть кількість місць — отримайте площу ділянки та забудови.' },
    { id: 'capacity', title: 'Місткість за відомою площею', description: 'Дізнайтеся, скільки повних місць уміщує задана площа.' },
    { id: 'demand', title: 'Потреба в місцях для об’єкта', description: 'Розрахуйте місця для житла, громадського об’єкта чи підприємства.' },
    { id: 'sanitary', title: 'Відстань до будинку або ділянки', description: 'Визначте мінімальну відстань до вибраного сусіднього об’єкта.' },
    { id: 'accessible', title: 'Доступні паркувальні місця', description: 'Визначте кількість місць за застосовними вимогами доступності.' },
    { id: 'electric', title: 'Електромобілі та зарядні точки', description: 'Окремо порахуйте місця для електромобілів і зарядні точки.' },
    { id: 'dimensions', title: 'Габарити місця та проїзду', description: 'Перевірте розміри для вибраного типу стоянки й автомобіля.' },
    { id: 'entrances', title: 'В’їзди, виїзди та накопичення', description: 'Дізнайтеся вимоги до в’їздів і накопичувального майданчика.' },
  ];
  const defaults = {
    area: { type: 'above', value: '100', floor: '1', compare: false, floors: ['1'] },
    capacity: { type: 'above', mode: 'site', value: '3000', floor: '1', compare: false, floors: ['1'] },
    demand: { group: 'housing', category: 'housing', housing: 'central', name: '', amount: '0', second: '100', rate: '20',
      businessType: 'business', businessArea: '', correction: 'none', percent: '20', confirmed: false, basis: '', components: [], editing: null },
    sanitary: { capacity: '100', type: 'above', fire: 'unknown', hasEv: false, ev: '0', target: 'housing', method: 'table',
      noWindows: 'unknown', noEntrances: 'unknown', sectional: 'unknown', neighbors: [], compare: false, check: false, actual: '' },
    accessible: { capacity: '100', type: 'above', purpose: 'permanent', context: 'general', accessibleCount: '7',
      medicalRate: '15', check: false, actualAccessible: '', accessibleWidth: '' },
    electric: { capacity: '100', type: 'above', zone: 'residential', check: false, actualEv: '', actualCharging: '' },
    dimensions: { type: 'above', purpose: 'permanent', vehicle: 'medium', traffic: 'one', compact: false,
      aisleMode: 'rear90', clearance: '0', check: false, width: '', length: '', aisle: '', radius: '', actualClearance: '' },
    entrances: { capacity: '100', type: 'above', purpose: 'permanent', check: false, emergency: '', entryWidth: '', accumulation: '' },
  };
  const labels = {
    type: 'Тип споруди', capacity: 'Місткість, місць', value: 'Вхідне значення', floor: 'Поверхів', floors: 'Порівнювані поверхи',
    mode: 'Вид площі', fire: 'Вогнестійкість', ev: 'Місця лише для авто без ДВЗ', target: 'Відстань до', method: 'Метод',
    noWindows: 'Немає вікон, які відчиняються', noEntrances: 'Немає в’їздів у бік будівель', sectional: 'Уздовж поздовжнього фасаду секційного будинку',
    purpose: 'Зберігання', context: 'Призначення об’єкта', accessibleCount: 'Прийнятий табличний мінімум', medicalRate: 'Прийнята частка, %',
    actual: 'Фактична відстань, м', actualAccessible: 'Фактично доступних місць', accessibleWidth: 'Фактична ширина доступного місця, м',
    actualEv: 'Фактично місць для електромобілів', actualCharging: 'Фактично зарядних точок', zone: 'Тип території',
    vehicle: 'Клас автомобіля', traffic: 'Рух у проїзді', compact: 'Зменшені габарити тимчасової стоянки',
    aisleMode: 'Спосіб заїзду', clearance: 'Захисна зона', width: 'Фактична ширина місця, м', length: 'Фактична довжина місця, м',
    aisle: 'Фактична ширина проїзду, м', radius: 'Фактичний радіус, м', actualClearance: 'Фактична захисна зона, м',
    emergency: 'Фактично аварійних виїздів', entryWidth: 'Фактична ширина об’єднаного в’їзду, м', accumulation: 'Фактична місткість накопичення, авто',
    name: 'Назва об’єкта', category: 'Категорія', housing: 'Тип житла', amount: 'Розрахункова кількість',
    second: 'Квартир із двома й більше кімнатами', rate: 'Прийнята ставка', businessType: 'Різновид ділового об’єкта',
    businessArea: 'Площа ділового об’єкта, м²', correction: 'Коригування', percent: 'Зміна до базового показника, %', confirmed: 'Умови підтверджено', basis: 'Підстава коригування',
  };
  function display(key, value) {
    const dictionaries = { type: types, purpose: purposes, zone: zones, context: contexts, method: methods, noWindows: yesNo, noEntrances: yesNo, sectional: yesNo,
      mode: { site: 'Площа ділянки, м²', build: 'Площа забудови, м²' },
      correction: { none: 'Без коригування', residential: 'За ДПТ до −20%', local: 'Місцеві умови ±20%', park: 'Парк біля станції −50–70%' },
      businessType: { business: 'Діловий об’єкт понад 100 м²', social: 'Соціальне забезпечення' },
      traffic: { one: 'Однобічний', two: 'Двобічний' } };
    if (dictionaries[key]) return dictionaries[key][value];
    if (key === 'fire') return value === 'unknown' ? 'Не визначено' : value;
    if (key === 'category') return value === 'housing' ? 'Житло' : norms.demand.find(row => row.id === value)?.label;
    if (key === 'housing') return norms.housing[value]?.label;
    if (key === 'target') return norms.sanitary.find(row => row.id === value)?.label;
    if (key === 'vehicle') return norms.vehicleClasses.find(row => row.id === value)?.label || 'Великий / інший клас';
    if (key === 'aisleMode') return norms.aisleModes.find(row => row.id === value)?.label;
    if (key === 'clearance') return norms.clearances[value]?.label;
    if (typeof value === 'boolean') return value ? 'Так' : 'Ні';
    if (Array.isArray(value)) return value.join(', ');
    return value === '' ? 'Не введено' : value;
  }
  function inputRows(input, keys) {
    return keys.map(key => ({ label: labels[key] || key, value: display(key, input[key]) }));
  }
  const measure = (label, value, unit, rule = '', note = '', status = 'calculated') => ({ label, value, unit, rule, note, status });
  function demandInput(draft) {
    return { ...draft, category: draft.group === 'housing' ? 'housing' : draft.category };
  }
  function describeDemand(input, row) {
    const result = inputRows(input, ['category', ...(input.category === 'housing' ? ['housing'] : []), 'name', 'amount']);
    result[result.length - 1].label = input.category === 'housing' ? 'Однокімнатних квартир'
      : norms.demand.find(item => item.id === input.category).unit;
    if (input.category === 'housing') result.push(...inputRows(input, ['second']));
    if (input.category === 'business') {
      result.push(...inputRows(input, ['businessType']));
      if (input.businessType !== 'social') result.push(...inputRows(input, ['businessArea']));
    }
    result.push({ label: 'Прийнята ставка / діапазон', value: row.rate + ' / ' + row.range.join('–') });
    if (input.correction !== 'none') result.push(...inputRows(input, ['correction', 'percent', 'confirmed', 'basis']));
    return result;
  }
  function calculate(key, draft) {
    const title = tasks.find(task => task.id === key)?.title;
    if (!title) throw new Error('Оберіть задачу.');
    const result = { task: key, title, summary: '', metrics: [], notes: [], inputs: [], details: [], variants: [], transfer: null };
    if (key === 'area' || key === 'capacity') {
      const mode = key === 'area' ? 'places' : draft.mode;
      const rows = calc.areas({ type: draft.type, mode, value: draft.value, floors: draft.compare ? draft.floors : [draft.floor] });
      const valid = rows.filter(row => !row.unavailable);
      const first = valid[0];
      result.summary = (key === 'area' ? draft.value + ' місць' : draft.value + ' м²') + ' · ' + types[draft.type]
        + (draft.type === 'open' ? '' : ' · ' + (draft.compare ? 'порівняння поверховості' : draft.floor + ' поверхів'));
      result.inputs = inputRows(draft, ['type', 'value', ...(key === 'capacity' ? ['mode'] : []), ...(draft.type === 'open' ? [] : [draft.compare ? 'floors' : 'floor'])]);
      result.inputs[1].label = key === 'area' ? 'Задана кількість місць' : display('mode', draft.mode);
      result.variants = rows;
      rows.filter(row => row.unavailable).forEach(row => result.notes.push(row.note));
      if (first && !first.capacity) result.notes.push('Цієї площі недостатньо для одного повного місця. Передавання місткості недоступне.');
      if (!first) result.notes.push('Для вибраної поверховості немає застосовного варіанта.');
      else {
        result.transfer = { capacity: first.capacity, type: draft.type };
        result.metrics = key === 'area' ? [
          measure('Площа ділянки', first.siteArea, 'м²', first.rule),
          measure('Площа забудови', first.buildArea, 'м²', first.rule, first.buildArea === null ? 'Для відкритої стоянки не застосовується.' : '', first.buildArea === null ? 'notApplicable' : 'calculated'),
        ] : [measure('Повних місць', first.capacity, 'місць', first.rule), measure('Залишок площі', first.remaining, 'м²', first.rule)];
        if (draft.compare) result.notes.push('Основні числа наведено для першого застосовного варіанта: ' + first.label + ' поверхів. Для кожного варіанта нижче є окремі дії.');
        result.details.push('Питомі площі, м²/місце: ділянка ' + first.site + '; забудова ' + (first.build ?? 'не застосовується') + '. Повторного множення на поверховість немає.',
          key === 'area' ? 'Площа = кількість місць × питомий показник.'
            : 'Теоретично ' + first.theoretical + ' місць; повних = округлити вниз. Використано ' + (mode === 'build' ? first.buildArea : first.siteArea) + ' м².',
          'Розрахунковий автомобіль I категорії — до 6 × 2,1 м; питомі площі не замінюють компонування.');
      }
    } else if (key === 'demand') {
      const inputs = draft.components.length ? draft.components : [demandInput(draft)];
      const rows = inputs.map(input => calc.demand(input));
      const sum = calc.mixedDemand(rows);
      result.summary = draft.components.length ? 'Підсумок ' + rows.length + ' доданих об’єктів' : rows[0].label;
      result.metrics = [measure('Усього потрібно', sum.total, 'місць', 'ДБН Б.2.2-12, табл. 10.5, 10.7–10.8', '', sum.review ? 'review' : 'calculated'),
        measure('Постійне зберігання', sum.permanent, 'місць'), measure('Тимчасові / гостьові', sum.temporary, 'місць')];
      rows.forEach((row, index) => {
        const prefix = rows.length > 1 ? (index + 1) + '. ' + row.label + ': ' : '';
        describeDemand(inputs[index], row).forEach(item => result.inputs.push({ label: prefix + item.label, value: item.value }));
        result.details.push(row.label + ': ' + row.formula + ' = ' + row.total + ' місць (постійні ' + row.permanent + '; тимчасові / гостьові ' + row.temporary + '). Діапазон за ставками ' + row.min + '–' + row.max + ' місць. ' + row.rule);
        result.notes.push(...row.notes.filter(note => row.review && note.includes('межі')));
        result.details.push(...row.notes.filter(note => !note.includes('межі')));
      });
      if (draft.components.length) result.notes.push('До підсумку входять лише додані об’єкти. Незбережена форма не врахована.');
      result.transfer = { capacity: sum.total };
      result.components = rows;
    } else if (key === 'sanitary') {
      const current = { ...draft, ev: draft.hasEv ? draft.ev : 0 };
      const options = { ...draft, actual: draft.check ? draft.actual : '' };
      const output = calc.sanitary(current, options);
      const selected = output.metrics[norms.sanitary.findIndex(row => row.id === draft.target)];
      result.summary = draft.capacity + ' місць · ' + types[draft.type] + ' → ' + display('target', draft.target);
      result.metrics = [selected];
      if (draft.compare) result.comparison = output.metrics;
      result.inputs = inputRows(current, ['type', 'capacity', 'ev', 'target', ...(draft.type === 'open' ? [] : ['fire']), 'method']);
      if (draft.method === 'reduce') result.inputs.push(...inputRows(draft, ['noWindows', 'noEntrances']));
      if (output.count >= 101 && output.count <= 300 && (draft.type === 'open' || draft.neighbors.some(row => row.type === 'open'))) result.inputs.push(...inputRows(draft, ['sectional']));
      if (draft.check) result.inputs.push(...inputRows(draft, ['actual']));
      draft.neighbors.forEach((row, index) => result.inputs.push({ label: 'Сусідня стоянка ' + (index + 1),
        value: row.capacity + ' місць; без ДВЗ ' + row.ev + '; ' + types[row.type] + (row.type === 'open' ? '' : '; вогнестійкість ' + display('fire', row.fire)) + '; відстань між територіями ' + row.distance + ' м' }));
      result.details = ['Розрахункова місткість для відстаней: ' + output.count + ' місць для ДВЗ.', ...output.notes];
    } else {
      let output;
      if (key === 'accessible') {
        output = calc.accessible(draft, { ...draft, actualAccessible: draft.check ? draft.actualAccessible : '', accessibleWidth: draft.check ? draft.accessibleWidth : '' });
        const main = output.metrics.find(row => row.label.startsWith('Спільний'));
        result.metrics = [main, ...output.metrics.filter(row => row !== main)];
        result.inputs = inputRows(draft, ['type', 'capacity', 'purpose', 'context']);
        if (draft.context === 'ambulatory') result.inputs.push(...inputRows(draft, ['medicalRate']));
        else if (Number(draft.capacity) >= 100 && Number(draft.capacity) <= 200) result.inputs.push(...inputRows(draft, ['accessibleCount']));
        if (draft.check) result.inputs.push(...inputRows(draft, ['actualAccessible', ...(draft.type === 'open' && ['service', 'ambulatory'].includes(draft.context) ? ['accessibleWidth'] : [])]));
      } else if (key === 'electric') {
        output = calc.electric(draft, { actualEv: draft.check ? draft.actualEv : '', actualCharging: draft.check ? draft.actualCharging : '' });
        result.metrics = output.metrics;
        result.inputs = inputRows(draft, ['type', 'capacity', 'zone']);
        if (draft.check) result.inputs.push(...inputRows(draft, ['actualEv', 'actualCharging']));
      } else if (key === 'dimensions') {
        const actual = Object.fromEntries(['width', 'length', 'aisle', 'radius', 'actualClearance'].map(field => [field, draft.check ? draft[field] : '']));
        const compact = draft.type === 'open' && draft.purpose === 'temporary' && draft.vehicle === 'medium' && draft.compact;
        output = calc.dimensions(draft, { ...draft, ...actual, compact });
        result.metrics = output.metrics;
        result.inputs = inputRows({ ...draft, compact }, ['type', 'vehicle', ...(draft.type === 'open' ? ['purpose', 'traffic', 'compact'] : ['aisleMode', 'clearance'])]);
        if (draft.check) result.inputs.push(...inputRows(draft, draft.type === 'open' ? ['width', 'length', 'aisle', 'radius'] : ['aisle', 'actualClearance']));
        result.details.push(...output.clearances.map(row => row.label + ': зберігання ' + (row.storage ?? '—') + ' м; пости ТО / ТР ' + row.service + ' м (табл. Є.1).'));
      } else {
        output = calc.entrances(draft, { emergency: draft.check ? draft.emergency : '', entryWidth: draft.check ? draft.entryWidth : '', accumulation: draft.check ? draft.accumulation : '' });
        result.metrics = output.metrics;
        result.inputs = inputRows(draft, ['type', 'capacity', 'purpose']);
        if (draft.check) result.inputs.push(...inputRows(draft, [...(draft.type === 'open' ? ['emergency', ...(Number(draft.capacity) <= 50 ? ['entryWidth'] : [])] : []), ...(Number(draft.capacity) > 300 ? ['accumulation'] : [])]));
      }
      result.summary = (draft.capacity ? draft.capacity + ' місць · ' : '') + types[draft.type];
      result.details.push(...output.notes);
    }
    if (draft.origin) result.inputs.unshift({ label: 'Походження даних', value: draft.origin });
    const sourceKeys = { area: ['parking'], capacity: ['parking'], demand: ['planning'],
      sanitary: ['planning', 'sanitary', 'sanitaryChange'], accessible: ['planning', 'inclusive'],
      electric: ['parking', 'planning'], dimensions: ['parking'], entrances: ['parking'] };
    result.sources = clone(sourceKeys[key].map(source => norms.sources[source]));
    return result;
  }
  function createSession() {
    const drafts = clone(defaults);
    const report = [];
    let sequence = 0;
    return {
      drafts, report,
      update(key, field, value) {
        drafts[key][field] = clone(value);
        if (['capacity', 'value', 'type', 'mode'].includes(field)) delete drafts[key].origin;
      },
      calculate(key) { return calculate(key, drafts[key]); },
      add(key, result = calculate(key, drafts[key])) {
        if (!result.metrics.length) throw new Error('Немає застосовного результату для додавання до звіту.');
        sequence += 1;
        const snapshot = clone({ ...result, id: sequence, savedAt: new Date().toISOString(), checkedOn: norms.checkedOn });
        report.push(snapshot);
        return snapshot;
      },
      remove(id) { const index = report.findIndex(row => row.id === id); if (index >= 0) report.splice(index, 1); },
      clear() { report.splice(0); },
      transfer(target, data, origin) {
        if (!Number.isSafeInteger(data.capacity) || data.capacity < 1) throw new Error('Немає повних місць для передавання.');
        if (!['area', 'sanitary', 'accessible', 'electric', 'entrances'].includes(target)) throw new Error('Ця задача не приймає місткість.');
        const draft = drafts[target];
        draft[target === 'area' ? 'value' : 'capacity'] = String(data.capacity);
        if (data.type) draft.type = data.type;
        draft.origin = origin;
      },
    };
  }
  function reportRows(report) {
    const rows = [['Розрахунок', 'Розділ', 'Показник', 'Значення', 'Одиниця', 'Фактично', 'Статус', 'Норматив / пояснення']];
    report.forEach((item, index) => {
      const name = (index + 1) + '. ' + item.title;
      rows.push([name, 'Знімок', item.summary, item.savedAt], [name, 'Нормативна база', item.checkedOn]);
      item.inputs.forEach(row => rows.push([name, 'Вхідні дані', row.label, row.value]));
      const all = [...item.metrics, ...(item.comparison || [])];
      all.forEach(row => rows.push([name, 'Результат', row.label, row.value, row.unit, row.actual, calc.statusLabels[row.status], [row.rule, row.note].filter(Boolean).join('. ')]));
      item.variants.forEach(row => {
        if (row.unavailable) rows.push([name, 'Варіант ' + row.label, 'Обмеження', row.note]);
        else rows.push([name, 'Варіант ' + row.label, 'Повних місць', row.capacity],
          [name, 'Варіант ' + row.label, 'Теоретична місткість', row.theoretical, 'місць'],
          [name, 'Варіант ' + row.label, 'Питома ділянка', row.site, 'м²/місце'],
          [name, 'Варіант ' + row.label, 'Питома забудова', row.build, 'м²/місце'],
          [name, 'Варіант ' + row.label, 'Площа ділянки', row.siteArea, 'м²'],
          [name, 'Варіант ' + row.label, 'Площа забудови', row.buildArea, 'м²'],
          [name, 'Варіант ' + row.label, 'Залишок площі', row.remaining, 'м²']);
      });
      [...item.notes, ...item.details].forEach(note => rows.push([name, 'Пояснення', note]));
      item.sources.forEach(source => rows.push([name, 'Джерела', source.title, source.url]));
    });
    rows.push(['Обмеження', 'Перевірка за реалізованими правилами; не є повною оцінкою відповідності проєкту.']);
    return rows;
  }
  globalThis.ParkingTasks = Object.freeze({ tasks, defaults, types, purposes, zones, contexts, methods, labels, display, demandInput, calculate, createSession, reportRows });
})();
