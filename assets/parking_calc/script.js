(() => {
  'use strict';
  const model = globalThis.ParkingTasks;
  const calc = globalThis.ParkingCalc;
  const norms = globalThis.ParkingNorms;
  const session = model.createSession();
  const $ = id => document.getElementById(id);
  const fmt = value => typeof value === 'number' ? new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 3 }).format(value) : String(value ?? '—');
  const typeOptions = Object.entries(model.types);
  const purposeOptions = Object.entries(model.purposes);
  const fireOptions = ['unknown', 'I', 'II', 'III', 'IIIa', 'IIIb', 'IV', 'IVa', 'V'].map(key => [key, key === 'unknown' ? 'Не визначено' : key]);
  const yesNoOptions = [['unknown', 'Не визначено'], ['yes', 'Так'], ['no', 'Ні']];
  let active = null;
  let currentResult = null;
  const openSections = {};
  const visibleFields = [];

  function element(tag, text = '', className = '') {
    const node = document.createElement(tag);
    if (text !== '') node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function button(text, action, className = 'btn') {
    const node = element('button', text, className);
    node.type = 'button'; node.addEventListener('click', action);
    return node;
  }
  function announce(text) { $('actionStatus').textContent = text; }
  function list(container, lines, className = 'notes') {
    if (!lines.length) return;
    const node = element('ul', '', className);
    lines.forEach(line => node.appendChild(element('li', line)));
    container.appendChild(node);
  }
  function disclosure(parent, title, key) {
    const sectionKey = active + '-' + key;
    const node = element('details', '', 'disclosure');
    node.open = Boolean(openSections[sectionKey]);
    node.addEventListener('toggle', () => { if (node.isConnected) openSections[sectionKey] = node.open; });
    node.appendChild(element('summary', title)); parent.appendChild(node);
    return node;
  }
  function field(parent, key, label, options = {}) {
    const draft = session.drafts[active];
    const wrapper = element('div', '', 'field');
    wrapper.id = active + '-row-' + key;
    const id = active + '-' + key;
    const control = element(options.options ? 'select' : 'input', '', options.check ? '' : 'control');
    control.id = id;
    if (options.options) options.options.forEach(([value, title, disabled]) => {
      const option = element('option', title); option.value = value; option.disabled = Boolean(disabled); control.appendChild(option);
    });
    else {
      control.type = options.check ? 'checkbox' : 'text';
      if (!options.check) { control.inputMode = options.text ? 'text' : 'decimal'; control.autocomplete = 'off'; }
    }
    if (options.check) control.checked = Boolean(draft[key]); else control.value = draft[key];
    const caption = element('label', label, options.check ? 'check' : '');
    caption.htmlFor = id;
    if (options.check) { caption.textContent = ''; caption.append(control, element('span', label)); wrapper.appendChild(caption); }
    else wrapper.append(caption, control);
    if (options.hint) {
      const hint = element('p', options.hint, 'hint'); hint.id = id + '-hint'; control.setAttribute('aria-describedby', hint.id); wrapper.appendChild(hint);
    }
    control.addEventListener(options.options || options.check ? 'change' : 'input', () => {
      session.update(active, key, options.check ? control.checked : control.value);
      if (active === 'demand' && ['group', 'category'].includes(key)) configureDemand(key);
      if (key === 'compare' && draft.compare && ['area', 'capacity'].includes(active)) draft.floors = [draft.floor];
      if (key === 'correction') {
        draft.percent = draft.correction === 'park' ? '50' : draft.correction === 'local' ? '0' : '20'; draft.confirmed = false;
      }
      if (control.tagName === 'SELECT' || options.check) { renderForm(); $(id)?.focus(); }
      refreshResult();
    });
    if (options.when) visibleFields.push({ wrapper, when: options.when });
    parent.appendChild(wrapper); return control;
  }
  function select(parent, key, label, options, extra = {}) { return field(parent, key, label, { ...extra, options }); }
  function check(parent, key, label, extra = {}) { return field(parent, key, label, { ...extra, check: true }); }
  function actualFields(parent, definitions) {
    check(parent, 'check', 'Перевірити фактичні показники');
    definitions.forEach(([key, label, when]) => field(parent, key, label, { when: () => session.drafts[active].check && (!when || when()) }));
  }
  function configureDemand(changed) {
    const draft = session.drafts.demand;
    if (changed === 'group') {
      draft.category = draft.group === 'housing' ? 'housing' : norms.demand.find(row => Boolean(row.industrial) === (draft.group === 'industrial')).id;
      draft.amount = draft.group === 'housing' ? '0' : '';
    }
    const row = norms.demand.find(item => item.id === draft.category);
    if (row) draft.rate = String(row.range[1]);
    draft.correction = 'none'; draft.confirmed = false;
  }
  function renderFloors(parent, draft) {
    select(parent, 'floor', 'Поверхів гаража', norms.floors.map(row => [row.id, row.label,
      draft.type === 'underground' && ['6', '7-9'].includes(row.id)]), { when: () => draft.type !== 'open' && !draft.compare });
    check(parent, 'compare', 'Порівняти поверховість', { when: () => draft.type !== 'open' });
    const compare = element('div');
    visibleFields.push({ wrapper: compare, when: () => draft.type !== 'open' && draft.compare });
    const choices = element('div', '', 'floor-options');
    norms.floors.forEach(row => {
      const id = active + '-floor-' + row.id;
      const input = element('input'); input.type = 'checkbox'; input.id = id; input.checked = draft.floors.includes(row.id);
      const label = element('label', '', 'check'); label.htmlFor = id; label.append(input, element('span', row.label));
      input.addEventListener('change', () => {
        draft.floors = input.checked ? [...draft.floors, row.id] : draft.floors.filter(key => key !== row.id); refreshResult();
      });
      choices.appendChild(label);
    });
    compare.append(choices, button('Всі поверхи', () => { draft.floors = norms.floors.map(row => row.id); renderForm(); refreshResult(); }, 'text-button'));
    parent.appendChild(compare);
  }
  function renderDemand(parent, draft) {
    select(parent, 'group', 'Для якого об’єкта?', [['housing', 'Житло'], ['public', 'Громадський об’єкт'], ['industrial', 'Підприємство']]);
    const housing = draft.group === 'housing';
    const record = norms.demand.find(row => row.id === draft.category);
    if (housing) {
      select(parent, 'housing', 'Тип житла / зона міста', Object.entries(norms.housing).map(([key, row]) => [key, row.label]));
      field(parent, 'amount', 'Однокімнатних квартир', { hint: 'У розрахунку враховуються з коефіцієнтом 0,5.' });
      field(parent, 'second', 'Квартир із двома й більше кімнатами');
    } else {
      select(parent, 'category', 'Категорія об’єкта', norms.demand.filter(row => Boolean(row.industrial) === (draft.group === 'industrial')).map(row => [row.id, row.label]));
      field(parent, 'amount', 'Кількість: ' + record.unit);
      if (record.id === 'business') {
        select(parent, 'businessType', 'Різновид об’єкта', [['business', 'Діловий об’єкт понад 100 м²'], ['social', 'Соціальне забезпечення']]);
        field(parent, 'businessArea', 'Площа ділового об’єкта, м²', { when: () => draft.businessType !== 'social' });
      }
      if (record.range[0] !== record.range[1]) field(parent, 'rate', 'Прийнята ставка на ' + (record.denominator || 100) + ' ' + record.unit,
        { hint: 'Нормативний діапазон: ' + record.range.join('–') + '. Початково верхня межа; інтерполяції ставок немає.' });
      else parent.appendChild(element('p', 'Ставка: ' + record.range[1] + ' на ' + (record.denominator || 100) + ' ' + record.unit + '.', 'hint'));
    }
    const extra = disclosure(parent, 'Назва та нормативні коригування', 'demand-extra');
    field(extra, 'name', 'Назва об’єкта (необов’язково)', { text: true });
    const options = [['none', 'Без коригування']];
    if (housing) options.push(['residential', 'За ДПТ: зменшення до 20%']);
    else if (!record.industrial) {
      options.push(['local', 'Місцеві умови: від −20 до +20%']);
      if (record.id === 'park') options.push(['park', 'Парк біля станції: зменшення 50–70%']);
    }
    select(extra, 'correction', 'Коригування потреби', options);
    field(extra, 'percent', 'Зміна до базового показника, %', { when: () => draft.correction !== 'none',
      hint: draft.correction === 'local' ? 'Від −20 до +20. Потрібне обґрунтування місцевими умовами.'
        : draft.correction === 'park' ? '50–70: лише біля метро / швидкісного трамвая з урахуванням пішохідних підходів.'
          : 'До 20: лише за відповідним ДПТ та умов п. 10.8.1 щодо центральних / історичних територій або реконструкції.' });
    check(extra, 'confirmed', 'Підтверджую виконання умов відповідної примітки', { when: () => draft.correction !== 'none' });
    field(extra, 'basis', 'Документ / обґрунтування', { text: true, when: () => draft.correction !== 'none' });
    const actions = $('draftActions');
    if (draft.components.length) {
      actions.appendChild(element('h3', 'Додані об’єкти'));
      draft.components.forEach((input, index) => {
        const row = calc.demand(input); const item = element('div', '', 'component');
        item.append(element('strong', row.label + ' — ' + row.total + ' місць'), element('p', 'Постійні: ' + row.permanent + '; тимчасові / гостьові: ' + row.temporary, 'hint'));
        const buttons = element('div', '', 'actions');
        buttons.append(button('Редагувати', () => {
          Object.assign(draft, JSON.parse(JSON.stringify(input)), { editing: index }); renderForm(); refreshResult(); $('demand-amount').focus();
        }, 'text-button'), button('Видалити', () => { draft.components.splice(index, 1); draft.editing = null; renderForm(); refreshResult(); }, 'text-button'));
        item.appendChild(buttons); actions.appendChild(item);
      });
      actions.appendChild(element('p', 'До результату входять лише додані об’єкти. Поточну форму потрібно зберегти окремо.', 'notice'));
    }
    const add = button(draft.editing !== null ? 'Зберегти зміни об’єкта' : draft.components.length ? 'Додати цей об’єкт до підсумку' : 'Додати ще один об’єкт', () => {
      try {
        const input = JSON.parse(JSON.stringify(model.demandInput(draft)));
        delete input.components; delete input.editing; delete input.origin; calc.demand(input);
        if (draft.editing !== null) draft.components[draft.editing] = input; else draft.components.push(input);
        draft.editing = null; draft.amount = ''; draft.second = '0'; draft.name = ''; draft.correction = 'none'; draft.confirmed = false; draft.basis = '';
        renderForm(); refreshResult(); announce('Об’єкт додано. Введіть наступний або додайте підсумок до звіту.');
      } catch (error) { announce(error.message); }
    });
    add.id = 'addComponent'; actions.appendChild(add);
    if (draft.editing !== null) actions.appendChild(button('Скасувати редагування', () => {
      draft.editing = null; draft.amount = ''; draft.second = '0'; renderForm(); refreshResult();
    }, 'text-button'));
  }

  function neighbors(parent, draft) {
    const section = disclosure(parent, 'Урахувати сусідні стоянки', 'neighbors');
    section.appendChild(element('p', 'Додаються місця для ДВЗ, якщо між територіями менше 6 м. Рівно 6 м не додається.', 'hint'));
    draft.neighbors.forEach((row, index) => {
      const group = element('fieldset', '', 'neighbor');
      group.appendChild(element('legend', 'Сусідня стоянка ' + (index + 1)));
      [['capacity', 'Загальна місткість, місць'], ['ev', 'Лише для авто без ДВЗ, місць'], ['distance', 'Відстань між територіями, м'],
        ['type', 'Тип споруди', typeOptions], ...(row.type === 'open' ? [] : [['fire', 'Вогнестійкість', fireOptions]])].forEach(([key, label, options]) => {
        const wrapper = element('div', '', 'field'); const id = 'neighbor-' + index + '-' + key;
        const caption = element('label', label); caption.htmlFor = id;
        const control = element(options ? 'select' : 'input', '', 'control'); control.id = id;
        if (options) options.forEach(([value, text]) => { const option = element('option', text); option.value = value; control.appendChild(option); });
        else { control.type = 'text'; control.inputMode = 'decimal'; }
        control.value = row[key];
        control.addEventListener(options ? 'change' : 'input', () => { row[key] = control.value; if (options) renderForm(); refreshResult(); });
        wrapper.append(caption, control); group.appendChild(wrapper);
      });
      group.appendChild(button('Видалити сусідню стоянку', () => { draft.neighbors.splice(index, 1); renderForm(); refreshResult(); }, 'text-button'));
      section.appendChild(group);
    });
    section.appendChild(button('Додати сусідню стоянку', () => {
      draft.neighbors.push({ capacity: '10', ev: '0', distance: '5', type: 'open', fire: 'unknown' });
      openSections[active + '-neighbors'] = true; renderForm(); refreshResult();
    }, 'text-button'));
  }
  function sanitaryCount(draft) {
    const own = calc.number(draft.capacity, 'Місткість') - (draft.hasEv ? calc.number(draft.ev, 'Місця без ДВЗ') : 0);
    return own + draft.neighbors.filter(row => calc.number(row.distance, 'Відстань') < 6)
      .reduce((sum, row) => sum + calc.number(row.capacity, 'Місткість сусіда') - calc.number(row.ev, 'Місця без ДВЗ'), 0);
  }
  function renderForm() {
    const draft = session.drafts[active];
    visibleFields.splice(0);
    const parent = $('taskFields'); parent.replaceChildren(element('legend', 'Вихідні дані'));
    $('draftActions').replaceChildren();
    if (active === 'area' || active === 'capacity') {
      select(parent, 'type', 'Що розраховуємо?', typeOptions);
      if (active === 'capacity') select(parent, 'mode', 'Яка площа відома?', [['site', 'Площа ділянки'], ['build', 'Площа забудови', draft.type === 'open']]);
      field(parent, 'value', active === 'area' ? 'Кількість місць' : draft.mode === 'site' ? 'Площа ділянки, м²' : 'Площа забудови, м²');
      renderFloors(parent, draft);
    } else if (active === 'demand') renderDemand(parent, draft);
    else {
      select(parent, 'type', 'Тип споруди', typeOptions);
      if (active !== 'dimensions') field(parent, 'capacity', 'Загальна місткість, місць');
      if (active === 'sanitary') {
        select(parent, 'target', 'До якого об’єкта визначаємо відстань?', norms.sanitary.map(row => [row.id, row.label]));
        select(parent, 'fire', 'Вогнестійкість гаража', fireOptions, { when: () => draft.type !== 'open', hint: 'Якщо невідома — залиште «Не визначено». Умовні пільги не застосуються.' });
        check(parent, 'hasEv', 'Є місця виключно для електромобілів без ДВЗ');
        field(parent, 'ev', 'Місць лише для авто без ДВЗ', { when: () => draft.hasEv, hint: 'Гібриди залишаються в розрахунковій місткості для ДВЗ.' });
        select(parent, 'sectional', 'Стоянка вздовж поздовжнього фасаду секційного будинку?', yesNoOptions, { when: () => {
          if (!(draft.type === 'open' || draft.neighbors.some(row => row.type === 'open')) || !(draft.target === 'housing' || draft.compare)) return false;
          try { const count = sanitaryCount(draft); return count >= 101 && count <= 300; } catch { return false; }
        } });
        const extra = disclosure(parent, 'Уточнити метод розрахунку', 'san-method');
        const nearby = draft.neighbors.filter(row => { try { return calc.number(row.distance, 'Відстань') < 6; } catch { return true; } });
        const garage = ['above', 'combined'].includes(draft.type) && nearby.every(row => ['above', 'combined'].includes(row.type));
        select(extra, 'method', 'Метод', Object.entries(model.methods).map(([value, text]) => [value, text,
          value === 'interpolate' ? !garage : value === 'reduce' ? !garage || !['I', 'II'].includes(draft.fire) || nearby.length > 0 : false]));
        select(extra, 'noWindows', 'Немає вікон гаража, які відчиняються?', yesNoOptions, { when: () => draft.method === 'reduce' });
        select(extra, 'noEntrances', 'Немає в’їздів у бік житлових / громадських будівель?', yesNoOptions, { when: () => draft.method === 'reduce' });
        extra.appendChild(element('p', '−25%: лише окремий надземний / наземно-підземний гараж I–II ступеня з обома підтвердженими умовами. Не поєднується з інтерполяцією.', 'hint'));
        neighbors(parent, draft);
        check(parent, 'compare', 'Порівняти відстані до всіх типів об’єктів');
        actualFields(parent, [['actual', 'Фактична відстань до вибраного об’єкта, м']]);
      } else if (active === 'accessible') {
        select(parent, 'purpose', 'Спосіб зберігання', purposeOptions);
        select(parent, 'context', 'Призначення об’єкта', Object.entries(model.contexts));
        field(parent, 'accessibleCount', 'Прийнятий мінімум у табличному діапазоні', {
          when: () => draft.context !== 'ambulatory' && Number(draft.capacity) >= 100 && Number(draft.capacity) <= 200,
          hint: Number(draft.capacity) === 100 ? 'На межі 100: перекриття 4 та 5–7. Початково 7; нижчий вибір може потребувати уточнення.' : 'Норма 5–7 місць; початково 7. Автоматичної інтерполяції немає.' });
        field(parent, 'medicalRate', 'Прийнята частка доступних місць, %', { when: () => draft.context === 'ambulatory', hint: 'Нормативний діапазон 10–15%; початково 15%.' });
        actualFields(parent, [['actualAccessible', 'Фактично доступних місць'], ['accessibleWidth', 'Фактична ширина доступного місця, м',
          () => draft.type === 'open' && ['service', 'ambulatory'].includes(draft.context)]]);
      } else if (active === 'electric') {
        select(parent, 'zone', 'Тип території', Object.entries(model.zones));
        actualFields(parent, [['actualEv', 'Фактично місць для електромобілів'], ['actualCharging', 'Фактично зарядних точок']]);
      } else if (active === 'dimensions') {
        select(parent, 'vehicle', 'Клас автомобіля', [...norms.vehicleClasses.map(row => [row.id, row.label]), ['large', 'Великий / інший клас']]);
        if (draft.type === 'open') {
          select(parent, 'purpose', 'Спосіб зберігання', purposeOptions);
          select(parent, 'traffic', 'Рух у проїзді', [['one', 'Однобічний'], ['two', 'Двобічний']]);
          check(parent, 'compact', 'Застосувати зменшені габарити 2,3 × 5,0 м', { when: () => draft.purpose === 'temporary' && draft.vehicle === 'medium' });
          actualFields(parent, [['width', 'Фактична ширина місця, м'], ['length', 'Фактична довжина місця, м'], ['aisle', 'Фактична ширина проїзду, м'], ['radius', 'Фактичний радіус бортового каменю, м']]);
        } else {
          select(parent, 'aisleMode', 'Спосіб заїзду та кут', norms.aisleModes.map(row => [row.id, row.label]));
          select(parent, 'clearance', 'Захисна зона', norms.clearances.map((row, index) => [String(index), row.label]));
          actualFields(parent, [['aisle', 'Фактична ширина проїзду, м'], ['actualClearance', 'Фактична захисна зона, м']]);
        }
      } else {
        select(parent, 'purpose', 'Спосіб зберігання', purposeOptions);
        actualFields(parent, [['emergency', 'Фактично аварійних виїздів', () => draft.type === 'open'],
          ['entryWidth', 'Фактична ширина об’єднаного в’їзду, м', () => draft.type === 'open' && Number(draft.capacity) <= 50],
          ['accumulation', 'Фактична місткість накопичення, авто', () => Number(draft.capacity) > 300]]);
      }
    }
    updateVisibility();
  }
  function updateVisibility() {
    visibleFields.forEach(row => { row.wrapper.hidden = !row.when(); });
    const draft = session.drafts[active];
    if (active === 'sanitary') {
      const nearby = draft.neighbors.filter(row => { try { return calc.number(row.distance, 'Відстань') < 6; } catch { return true; } });
      const garage = ['above', 'combined'].includes(draft.type) && nearby.every(row => ['above', 'combined'].includes(row.type));
      const options = Array.from($('sanitary-method').options);
      options.find(option => option.value === 'interpolate').disabled = !garage;
      options.find(option => option.value === 'reduce').disabled = !garage || !['I', 'II'].includes(draft.fire) || nearby.length > 0;
    }
    if (active === 'accessible') $('accessible-accessibleCount-hint').textContent = Number(draft.capacity) === 100
      ? 'На межі 100: перекриття 4 та 5–7. Початково 7; нижчий вибір може потребувати уточнення.'
      : 'Норма 5–7 місць; початково 7. Автоматичної інтерполяції немає.';
    const origin = session.drafts[active].origin;
    $('inputOrigin').hidden = !origin; $('inputOrigin').textContent = origin || '';
  }
  function metricValue(row) {
    if (row.value !== null) return fmt(row.value) + (row.unit ? ' ' + row.unit : '');
    return row.status === 'calculated' && row.note ? row.note : calc.statusLabels[row.status];
  }
  function renderMetrics(container, rows, keyCount = 2) {
    const grid = element('div', '', 'result-grid' + (keyCount === 1 ? ' single-result' : keyCount === 3 ? ' three-results' : '')); const secondary = element('dl', '', 'metric-list');
    rows.forEach((row, index) => {
      const item = element('div', '', index < keyCount ? 'key-result' : 'metric-line');
      let statusContainer = item;
      if (index < keyCount) {
        item.appendChild(element('span', row.label, 'metric-label'));
        const value = element('strong', row.value === null ? metricValue(row) : fmt(row.value), 'metric-value' + (row.value === null ? ' text-value' : ''));
        if (row.value !== null && row.unit) value.appendChild(element('span', row.unit, 'metric-unit'));
        item.appendChild(value);
      } else {
        statusContainer = element('dd', metricValue(row));
        item.append(element('dt', row.label), statusContainer);
      }
      if (row.status !== 'calculated' && row.value !== null) statusContainer.appendChild(element('span', calc.statusLabels[row.status], 'status status-' + row.status));
      if (row.actual !== null && row.actual !== undefined) statusContainer.appendChild(element('span', 'Фактично: ' + fmt(row.actual) + (row.unit ? ' ' + row.unit : ''), 'status'));
      if (['fail', 'review', 'individual', 'approval', 'electric'].includes(row.status) && row.note) statusContainer.appendChild(element('p', row.note, 'notice' + (row.status === 'fail' ? ' error' : '')));
      (index < keyCount ? grid : secondary).appendChild(item);
    });
    container.append(grid, secondary);
  }
  function table(container, headers, values) {
    const wrapper = element('div', '', 'table-scroll');
    wrapper.tabIndex = 0; wrapper.setAttribute('role', 'region'); wrapper.setAttribute('aria-label', headers.join(', '));
    const node = element('table'); const head = element('thead'); const tr = element('tr');
    headers.forEach(text => { const cell = element('th', text); cell.scope = 'col'; tr.appendChild(cell); });
    head.appendChild(tr); const body = element('tbody');
    values.forEach(row => {
      const line = element('tr');
      row.forEach(value => { const cell = element('td'); if (value?.nodeType) cell.appendChild(value); else cell.textContent = fmt(value); line.appendChild(cell); });
      body.appendChild(line);
    });
    node.append(head, body); wrapper.appendChild(node); container.appendChild(wrapper);
  }
  function sources(container, values) {
    const listNode = element('ul', '', 'source-list');
    values.forEach(source => {
      const item = element('li'); const link = element('a', source.title);
      link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; item.appendChild(link); listNode.appendChild(item);
    });
    container.appendChild(listNode);
  }
  function explanation(container, result, expanded = false) {
    const wrapper = expanded ? element('div') : disclosure(container, 'Як отримано результат', 'explanation');
    wrapper.appendChild(element('h3', 'Використані дані')); const inputs = element('dl', '', 'metric-list');
    result.inputs.forEach(row => { const line = element('div', '', 'metric-line'); line.append(element('dt', row.label), element('dd', fmt(row.value))); inputs.appendChild(line); });
    wrapper.appendChild(inputs);
    list(wrapper, [...result.metrics.map(row => [row.label, row.rule, row.note].filter(Boolean).join('. ')), ...result.details]);
    wrapper.appendChild(element('h3', 'Нормативні джерела · ' + norms.checkedOn)); sources(wrapper, result.sources);
    if (expanded) container.appendChild(wrapper);
  }

  function variantResult(result, row) {
    const copy = JSON.parse(JSON.stringify(result));
    copy.summary = model.types[row.type] + ' · ' + row.label + ' поверхів · ' + row.capacity + ' повних місць';
    copy.variants = [row]; copy.notes = copy.notes.filter(note => !note.includes('першого застосовного'));
    copy.transfer = { capacity: row.capacity, type: row.type };
    copy.metrics = result.task === 'area'
      ? [{ label: 'Площа ділянки', value: row.siteArea, unit: 'м²', rule: row.rule, status: 'calculated' },
        { label: 'Площа забудови', value: row.buildArea, unit: 'м²', rule: row.rule, status: row.buildArea === null ? 'notApplicable' : 'calculated' }]
      : [{ label: 'Повних місць', value: row.capacity, unit: 'місць', rule: row.rule, status: 'calculated' },
        { label: 'Залишок площі', value: row.remaining, unit: 'м²', rule: row.rule, status: 'calculated' }];
    copy.details = ['Питомі показники: ділянка ' + row.site + '; забудова ' + row.build + ' м²/місце. ' + row.rule,
      result.task === 'area' ? 'Площа = ' + row.capacity + ' місць × питомий показник.'
        : 'Теоретично ' + row.theoretical + ' місць; повних = округлити вниз. Залишок ' + row.remaining + ' м².'];
    copy.inputs = copy.inputs.filter(input => !['Поверхів', 'Порівнювані поверхи'].includes(input.label));
    copy.inputs.push({ label: 'Поверхів', value: row.label }); return copy;
  }
  function addSnapshot(result) {
    session.add(active, result); updateReportCount(); announce('Знімок додано до звіту. У звіті: ' + session.report.length + '.');
  }
  function transferActions(parent, data, origin) {
    if (!data || !data.capacity) return;
    const group = element('details', '', 'disclosure no-print');
    group.appendChild(element('summary', 'Розрахувати далі для ' + data.capacity + ' місць'));
    const actions = element('div', '', 'actions');
    [['area', 'Площу'], ['sanitary', 'Відстань'], ['accessible', 'Доступні місця'], ['electric', 'Зарядки'], ['entrances', 'В’їзди та виїзди']]
      .filter(([key]) => key !== active).forEach(([key, text]) => {
        actions.appendChild(button(text + ' для ' + data.capacity + ' місць', () => {
          const note = 'Підставлено ' + data.capacity + ' місць' + (data.type ? '; ' + model.types[data.type] : '') + '. Джерело: ' + origin + '. Решту полів не змінено.';
          session.transfer(key, data, note); showTask(key); announce(note);
        }, 'text-button'));
      });
    group.appendChild(actions); parent.appendChild(group);
  }
  function renderComparisons(container, result, interactive) {
    if (result.variants.length > 1) {
      const values = result.variants.map(row => {
        if (row.unavailable) return [row.label, '—', '—', '—', '—', '—', row.note];
        const actions = element('div', '', 'actions');
        if (interactive) {
          actions.appendChild(button('Додати цей варіант до звіту', () => addSnapshot(variantResult(result, row)), 'text-button'));
          transferActions(actions, { capacity: row.capacity, type: row.type }, row.label + ' поверхів; ' + result.title);
        } else actions.textContent = row.remaining === null ? '—' : 'Залишок ' + fmt(row.remaining) + ' м²';
        return [row.label, row.theoretical, row.capacity, row.buildArea, row.siteArea, row.remaining, actions];
      });
      table(container, ['Поверхів', 'Теоретично, місць', 'Повних місць', 'Забудова, м²', 'Ділянка, м²', 'Залишок, м²', interactive ? 'Дії' : 'Примітка'], values);
    }
    if (result.comparison) table(container, ['Об’єкт', 'Відстань, м', 'Статус / умови'], result.comparison.map(row => [
      row.label, row.value, calc.statusLabels[row.status] + (row.note ? '. ' + row.note : ''),
    ]));
  }
  function refreshResult() {
    if (!active) return;
    updateVisibility();
    const container = $('taskResult'); container.replaceChildren(); $('resultActions').replaceChildren(); currentResult = null;
    try {
      currentResult = session.calculate(active);
      container.appendChild(element('p', currentResult.summary, 'result-context'));
      renderMetrics(container, currentResult.metrics, active === 'demand' ? 3 : ['accessible', 'sanitary'].includes(active) ? 1 : 2);
      list(container, currentResult.notes); renderComparisons(container, currentResult, true); explanation(container, currentResult);
      const add = button('Додати до звіту', () => addSnapshot(currentResult)); add.id = 'addToReport'; add.disabled = !currentResult.metrics.length;
      $('resultActions').appendChild(add);
      transferActions($('resultActions'), currentResult.variants.length > 1 ? null : currentResult.transfer, currentResult.summary);
    } catch (failure) { container.appendChild(element('p', failure.message, 'notice error')); }
    if (active === 'demand') {
      const draft = session.drafts.demand; const add = $('addComponent');
      try {
        const row = calc.demand(model.demandInput(draft)); add.disabled = false;
        if (draft.components.length) container.appendChild(element('p', 'Поточна форма ще не збережена: ' + row.total + ' місць. Натисніть «' + add.textContent + '», щоб включити її до підсумку.', 'notice'));
      } catch (failure) {
        add.disabled = true;
        if (draft.components.length && draft.amount !== '') container.appendChild(element('p', 'Чернетка не входить до підсумку: ' + failure.message, 'notice error'));
      }
    }
  }
  function updateReportCount() {
    $('openReport').textContent = 'Звіт (' + session.report.length + ')';
    ['copyReport', 'downloadCsv', 'printReport', 'clearReport'].forEach(id => { $(id).disabled = !session.report.length; });
  }
  function renderReport() {
    $('manualReportText')?.remove();
    const container = $('reportList'); container.replaceChildren(); updateReportCount();
    if (!session.report.length) {
      container.appendChild(element('p', 'Звіт порожній. Відкрийте задачу й натисніть «Додати до звіту» біля потрібного результату.', 'notice')); return;
    }
    session.report.forEach((item, index) => {
      const article = element('article', '', 'report-item');
      article.append(element('h3', (index + 1) + '. ' + item.title), element('p', item.summary, 'result-context'),
        element('p', 'Знімок від ' + new Date(item.savedAt).toLocaleString('uk-UA') + '; нормативна база ' + item.checkedOn + '.', 'hint'));
      article.appendChild(button('Видалити зі звіту', () => { session.remove(item.id); renderReport(); announce('Знімок видалено зі звіту.'); }, 'text-button no-print'));
      renderMetrics(article, item.metrics); list(article, item.notes); renderComparisons(article, item, false); explanation(article, item, true); container.appendChild(article);
    });
  }
  function showTask(key) {
    active = key; const task = model.tasks.find(row => row.id === key);
    $('taskMenu').hidden = true; $('reportWorkspace').hidden = true; $('taskWorkspace').hidden = false;
    $('taskTitle').textContent = task.title; $('taskDescription').textContent = task.description;
    renderForm(); refreshResult(); $('taskTitle').focus();
  }
  function showMenu() {
    $('taskMenu').hidden = false; $('taskWorkspace').hidden = true; $('reportWorkspace').hidden = true; $('menuTitle').focus();
  }
  model.tasks.forEach(task => {
    const choice = button('', () => showTask(task.id), 'task-choice'); choice.id = 'choose-' + task.id;
    const text = element('span'); text.append(element('strong', task.title), element('span', task.description, 'hint'));
    const arrow = element('span', '→', 'task-arrow'); arrow.setAttribute('aria-hidden', 'true'); choice.append(text, arrow); $('taskList').appendChild(choice);
  });
  $('taskForm').addEventListener('submit', event => event.preventDefault());
  $('backTasks').addEventListener('click', showMenu);
  $('backFromReport').addEventListener('click', () => { if (active) showTask(active); else showMenu(); });
  $('openReport').addEventListener('click', () => {
    $('taskMenu').hidden = true; $('taskWorkspace').hidden = true; $('reportWorkspace').hidden = false; renderReport(); $('reportTitle').focus();
  });
  $('clearReport').addEventListener('click', () => { session.clear(); renderReport(); announce('Звіт очищено.'); });
  $('copyReport').addEventListener('click', async () => {
    if (!session.report.length) return;
    const text = ['Вибрані розрахунки автостоянок і гаражів', ...model.reportRows(session.report).map(row => row.map(fmt).join(' | '))].join('\n');
    try { await navigator.clipboard.writeText(text); announce('Звіт скопійовано.'); }
    catch {
      $('manualReportText')?.remove();
      const fieldNode = element('textarea'); fieldNode.id = 'manualReportText'; fieldNode.value = text; fieldNode.setAttribute('aria-label', 'Звіт для ручного копіювання');
      $('reportWorkspace').appendChild(fieldNode); fieldNode.select();
      if (typeof document.execCommand === 'function' && document.execCommand('copy')) { fieldNode.remove(); announce('Звіт скопійовано.'); }
      else announce('Текст виділено. Натисніть Ctrl+C для копіювання.');
    }
  });
  $('downloadCsv').addEventListener('click', () => {
    if (!session.report.length) return;
    const blob = new Blob([calc.csv(model.reportRows(session.report))], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = element('a'); link.href = url; link.download = 'parking-selected-calculations.csv';
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); announce('CSV зі збереженими розрахунками підготовлено.');
  });
  $('printReport').addEventListener('click', () => { if (session.report.length) { renderReport(); window.print(); } });
  window.addEventListener('beforeprint', renderReport);
  updateReportCount();
})();

