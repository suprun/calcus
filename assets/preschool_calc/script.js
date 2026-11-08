(() => {
  'use strict';

  const norms = globalThis.PreschoolNorms;
  const calc = globalThis.PreschoolCalc;
  const draft = calc.createDraft();
  let current;
  let nextGroup = 1;
  let siteEdit = null;
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const fmt = value => (value === null || value === undefined ? '—' : new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 2 }).format(value));
  const yesNo = { unknown: 'Не визначено', yes: 'Так', no: 'Ні' };
  const fields = {
    general: [
      ['name', 'Назва об’єкта', 'text'], ['kind', 'Тип закладу', norms.kinds],
      ['capacity', 'Загальна місткість, дітей'], ['construction', 'Вид будівництва', { new: 'Нове будівництво', reconstruction: 'Реконструкція', repair: 'Капітальний ремонт' }],
      ['placement', 'Розміщення', { detached: 'Окрема будівля', residential: 'Вбудований / вбудовано-прибудований у житловий будинок', public: 'Вбудований / вбудовано-прибудований у громадський будинок', attached: 'Прибудований заклад' }],
      ['settlement', 'Населений пункт', { urban: 'Місто', rural: 'Село / селище' }],
      ['dense', 'Ущільнена забудова', 'check'], ['slope', 'Ухил земельної ділянки, %'],
    ],
    site: [
      ['siteUnit', 'Одиниці прийнятої площі', { sqm: 'м²', ha: 'га' }],
      ['reduction', 'Одна підстава зменшення площі', { none: 'Без зменшення', dense: 'Реконструкція та щільна забудова: 20 %', slope: 'Ухил ділянки понад 20 %: 15 %', built: 'Вбудований у житловий будинок: 10 %' }],
      ['reductionConfirmed', 'Підтверджую застосовність вибраної підстави', 'check'],
      ['noSite', 'Розглянути варіант без окремої території', 'check'],
    ],
    building: [
      ['footprint', 'Проєкція основної будівлі на землю, м²'], ['floors', 'Верхній поверх розміщення ЗДО'],
      ['seismic', 'Сейсмічний район', 'check'], ['fireClass', 'Ступінь вогнестійкості', { unknown: 'Не визначено', I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V' }],
      ['fireLadder', 'Пожежний підрозділ укомплектований автодрабиною', yesNo], ['fireRadius', 'Радіус виїзду пожежного підрозділу, км'],
    ],
    play: [
      ['stadium', 'Об’єднати два фізкультурні майданчики в міністадіон', 'check'],
      ['separateSmall', 'Для малого закладу — окремий майданчик кожній групі', 'check'],
      ['compactSmall', 'Застосувати 7 м²/дитину в умовах ущільненої забудови', 'check'],
    ],
    extras: [
      ['ecology', 'Екологічна стежина', 'check'], ['naturalists', 'Юні натуралісти', 'check'],
      ['zoo', 'Зоокуточок', 'check'], ['orientation', 'Майданчик орієнтування для спеціального садка', 'check'],
      ['events', 'Майданчик заходів', 'check'],
    ],
    green: [['roofGreen', 'Інше озеленення покрівлі поза майданчиками, м²']],
    balance: [['paths', 'Додаткові проїзди й доріжки поза іншими зонами, м²'], ['otherLand', 'Інша зайнята земля поза врахованими зонами, м²']],
    distances: [
      ['redline', 'Будівля → червона лінія, м'], ['ruralBasis', 'Обґрунтування скорочення сільського відступу', 'text'],
      ['playDistance', 'Майданчик → житло / житлові вікна, м'], ['serviceDistance', 'Контейнерний майданчик / гараж → будівля ЗДО, м'],
      ['fireWidth', 'Ширина пожежного під’їзду, м'], ['ring', 'Є круговий пожежний проїзд', yesNo],
      ['fence', 'Висота огорожі території, м'],
    ],
    roof: [
      ['roofArea', 'Доступна площа експлуатованої покрівлі, м²'], ['roofHeight', 'Висота рівня майданчика над землею, м'],
      ['roofFence', 'Висота огородження покрівлі, м'], ['roofGap', 'Просвіт вертикальних елементів огородження, м'],
      ['roofNet', 'Висота захисної сітки, м'], ['roofExits', 'Незалежних евакуаційних шляхів'],
      ['roofConditions', 'Інші умови безпеки покрівлі опрацьовані', yesNo],
    ],
    access: [
      ['access', 'Ввести параметри зовнішньої доступності', 'check'],
      ['pathWidth', 'Ширина доріжки до центрального входу, м'], ['pathLength', 'Довжина звуженої ділянки доріжки, м'],
      ['pathSlope', 'Поздовжній ухил доріжки, %'], ['pathCross', 'Поперечний ухил доріжки, %'],
      ['ramp', 'Є зовнішній пандус', 'check'], ['rampRise', 'Перепад висот пандуса, м'],
      ['rampSlope', 'Прийнятий ухил пандуса, %'], ['rampWidth', 'Ширина пандуса у просвіті, м'],
      ['rampLanding', 'Глибина горизонтальної площадки пандуса, м'],
      ['stairs', 'Є зовнішні сходи', 'check'], ['stairWidth', 'Ширина сходового маршу, м'],
      ['tread', 'Глибина сходинки, м'], ['riser', 'Прийнята висота сходинки, м'], ['stairCross', 'Поперечний ухил сходинок, %'],
      ['outdoorHeight', 'Висота відкритого елемента над землею, м'], ['outdoorFence', 'Висота огородження відкритого елемента, м'],
      ['outdoorGap', 'Просвіт вертикальних елементів, м'], ['handLow', 'Висота нижнього поручня, м'],
      ['handHigh', 'Висота верхнього поручня, м'], ['handDiameter', 'Діаметр поручня, см'],
      ['handExtension', 'Горизонтальне продовження поручня, м'],
    ],
    dropoff: [['dropoff', 'Є майданчик посадки-висадки', 'check'], ['dropWidth', 'Ширина посадки-висадки, м'], ['dropLength', 'Довжина посадки-висадки, м']],
  };
  function fieldMarkup([key, label, type]) {
    const id = `input-${key}`;
    if (type === 'check') return `<div class="field check-field" id="field-${key}"><input type="checkbox" id="${id}" data-key="${key}"${draft[key] ? ' checked' : ''}><label for="${id}">${escape(label)}</label></div>`;
    const control = type && typeof type === 'object'
      ? `<select class="control" id="${id}" data-key="${key}">${Object.entries(type).map(([value, text]) => `<option value="${escape(value)}"${draft[key] === value ? ' selected' : ''}>${escape(text)}</option>`).join('')}</select>`
      : `<input class="control" type="text"${type === 'text' ? '' : ' inputmode="decimal"'} id="${id}" data-key="${key}" value="${escape(draft[key])}" autocomplete="off">`;
    return `<div class="field" id="field-${key}"><label for="${id}">${escape(label)}</label>${control}</div>`;
  }
  Object.entries(fields).forEach(([section, definitions]) => { $(`${section}Fields`).innerHTML = definitions.map(fieldMarkup).join(''); });

  function renderGroups() {
    $('groupList').innerHTML = draft.groups.map((group, index) => `<div class="group-row">
      <div class="field"><label for="count-${group.id}">Група ${index + 1}: дітей</label><input class="control" id="count-${group.id}" data-group="${group.id}" data-property="count" type="text" inputmode="numeric" value="${escape(group.count)}"></div>
      <div class="field"><label for="age-${group.id}">Вік дітей</label><select class="control" id="age-${group.id}" data-group="${group.id}" data-property="age">${Object.entries(norms.ages).map(([key, label]) => `<option value="${key}"${group.age === key ? ' selected' : ''}>${label}</option>`).join('')}</select></div>
      <button class="btn no-print" type="button" data-remove="${group.id}" aria-label="Видалити групу ${index + 1}">Видалити</button></div>`).join('');
  }
  function renderAreas(section) {
    const rows = current.areas.filter(row => row.section === section);
    $(`${section}Areas`).innerHTML = rows.map(row => {
      const manual = Object.hasOwn(draft.overrides, row.key);
      const hectares = row.key === 'site' && draft.siteUnit === 'ha';
      const factor = hectares ? 10000 : 1;
      const actual = manual ? draft.overrides[row.key] : (row.actual ?? '');
      let inputValue = actual;
      if (hectares && actual !== '') {
        try { inputValue = calc.number(actual, row.label) / factor; } catch { inputValue = actual; }
      }
      if (row.key === 'site' && manual && siteEdit !== null) inputValue = siteEdit;
      const canLocate = row.land && ['play', 'extras'].includes(section);
      const canGreen = canLocate && !row.key.startsWith('shade-');
      return `<div class="area-row status-${row.status}"><h3>${escape(row.label)}</h3>
        <div class="area-values"><div class="norm-value"><small>Розрахунок, м²</small>${fmt(row.norm)}</div>
        <div class="field"><label for="area-${row.key}">Прийнято, ${hectares ? 'га' : 'м²'} · ${manual ? 'вручну' : 'автоматично'}</label><input class="control" id="area-${row.key}" data-override="${row.key}" type="text" inputmode="decimal" value="${escape(inputValue)}" aria-describedby="delta-${row.key}"></div>
        <button class="btn no-print" type="button" data-auto="${row.key}"${manual ? '' : ' disabled'}>За розрахунком</button></div>
        <p class="area-delta" id="delta-${row.key}">Різниця: ${fmt(row.delta)} м² · ${norms.statuses[row.status]}</p>
        ${canLocate ? `<div class="fields area-meta"><div class="field"><label for="location-${row.key}">Розміщення</label><select class="control" id="location-${row.key}" data-location="${row.key}"><option value="ground"${row.location === 'ground' ? ' selected' : ''}>На землі</option><option value="roof"${row.location === 'roof' ? ' selected' : ''}>На покрівлі</option></select></div>${canGreen ? `<div class="field"><label for="green-${row.key}">Озеленена частина цієї зони, м²</label><input class="control" id="green-${row.key}" data-green="${row.key}" type="text" inputmode="decimal" value="${escape(draft.greenParts[row.key] || '0')}"></div>` : ''}</div>` : ''}
        <p class="area-note"><a href="${row.key === 'site' ? norms.planning : norms.source}" target="_blank" rel="noopener noreferrer">${escape(row.rule)}</a>${row.note ? ` · ${escape(row.note)}` : ''}</p></div>`;
    }).join('');
  }
  const checkMarkup = item => `<div class="notice status-${item.status}"><strong>${escape(item.label)} · ${norms.statuses[item.status]}</strong>${escape(item.detail)}${item.rule ? `<div class="area-note">${escape(item.rule)}</div>` : ''}</div>`;
  function showField(key, visible) { $(`field-${key}`).hidden = !visible; }
  function conditions() {
    showField('reductionConfirmed', draft.reduction !== 'none');
    ['fireRadius', 'fireLadder'].forEach(key => showField(key, draft.placement === 'detached' && draft.kind !== 'special' && Number(draft.floors.replace(',', '.')) === 3));
    showField('ruralBasis', draft.settlement === 'rural');
    showField('ring', draft.placement === 'detached');
    showField('stadium', current.small === false && draft.kind === 'garden' && Number(draft.capacity) > 160);
    showField('separateSmall', current.small === true);
    showField('compactSmall', current.small === true && draft.kind !== 'special' && draft.dense);
    showField('orientation', draft.kind === 'special');
    const roofActive = current.areas.some(row => row.land && row.location === 'roof');
    ['roofHeight', 'roofFence', 'roofGap', 'roofExits', 'roofConditions'].forEach(key => showField(key, roofActive));
    showField('roofNet', current.areas.some(row => row.location === 'roof' && /^(sport-|stadium|small-)/.test(row.key)));
    fields.access.forEach(([key]) => {
      let visible = key === 'access' || draft.access;
      if (['rampRise', 'rampSlope', 'rampWidth', 'rampLanding'].includes(key)) visible = draft.access && draft.ramp;
      if (['stairWidth', 'tread', 'riser', 'stairCross'].includes(key)) visible = draft.access && draft.stairs;
      if (['outdoorHeight', 'outdoorFence', 'outdoorGap', 'handLow', 'handHigh', 'handDiameter', 'handExtension'].includes(key)) visible = draft.access && (draft.stairs || draft.ramp);
      showField(key, visible);
    });
    ['dropWidth', 'dropLength'].forEach(key => showField(key, draft.dropoff));
  }
  function render() {
    const active = document.activeElement;
    const focus = active?.id;
    const selection = active && active.tagName === 'INPUT' && active.type === 'text' ? [active.selectionStart, active.selectionEnd] : null;
    current = calc.evaluate(draft);
    ['site', 'play', 'extras', 'household', 'green'].forEach(renderAreas);
    Object.keys(fields).concat(['groups', 'household']).forEach(section => {
      const output = $(`${section}Results`);
      if (output) output.innerHTML = current.checks.filter(item => item.section === section).map(checkMarkup).join('');
    });
    conditions();
    const metrics = [['Ділянка', current.site, 'м²'], ['Забудова', current.buildingPercent, '%'],
      ['Озеленення', current.green?.percent, '%'], ['Зайнято землі', current.balance?.used, 'м²'],
      ['Залишок землі', current.balance?.remaining, 'м²'], ['Майданчики на покрівлі', current.roofUsed, 'м²']];
    $('keyMetrics').innerHTML = metrics.map(([label, value, unit]) => `<div class="metric"><span>${label}</span><strong>${fmt(value)} <small>${unit}</small></strong></div>`).join('');
    const summary = current.areas.map(row => `<tr class="status-${row.status}"><th scope="row">${escape(row.label)}, м²</th><td>${fmt(row.norm)}</td><td>${fmt(row.actual)}</td><td>${fmt(row.delta)}</td><td>${norms.statuses[row.status]}</td></tr>`);
    const additional = [['Основна будівля, м²', null, current.footprint, null],
      ['Частка забудови, %', null, current.buildingPercent, null],
      ['Озеленення загалом, м²', current.green?.minimum, current.green?.total, current.green?.delta],
      ['Зайнято землі, м²', null, current.balance?.used, null], ['Залишок землі, м²', null, current.balance?.remaining, null]];
    additional.forEach(([label, norm, actual, delta]) => summary.push(`<tr><th scope="row">${label}</th><td>${fmt(norm)}</td><td>${fmt(actual)}</td><td>${fmt(delta)}</td><td>${actual === null || actual === undefined ? 'Неповні дані' : 'Розраховано'}</td></tr>`));
    $('summaryBody').innerHTML = summary.join('');
    const issues = current.checks.filter(item => !['pass', 'calculated'].includes(item.status));
    const failedAreas = current.areas.filter(row => ['fail', 'error', 'incomplete'].includes(row.status));
    $('liveStatus').textContent = `Оновлено. Питань для перевірки: ${issues.length + failedAreas.length}. Це оцінка лише реалізованих показників.`;
    $('issues').innerHTML = issues.map(checkMarkup).join('');
    $('manualCopy').hidden = true;
    if (focus && $(focus) && $(focus) !== document.activeElement) {
      $(focus).focus({ preventScroll: true });
      if (selection) $(focus).setSelectionRange(...selection);
    }
  }
  function update(event) {
    const element = event.target;
    if (event.type === 'input' && (element.type === 'checkbox' || element.tagName === 'SELECT')) return;
    if (event.type === 'change' && element.type === 'text') return;
    const { key, group, property, override, location, green } = element.dataset;
    if (key) {
      if (key === 'siteUnit') {
        try { calc.number(draft.overrides.site, 'Площа'); siteEdit = null; } catch { /* Preserve incomplete area input while changing units. */ }
      }
      draft[key] = element.type === 'checkbox' ? element.checked : element.value;
    }
    else if (group) {
      const row = draft.groups.find(item => item.id === group);
      if (row) row[property] = element.value;
    } else if (override) {
      let value = element.value;
      if (override === 'site') siteEdit = value;
      if (override === 'site' && draft.siteUnit === 'ha') {
        try { value = String(calc.number(value, 'Площа, га') * 10000); } catch { value = ''; }
      }
      draft.overrides[override] = value;
    } else if (location) draft.locations[location] = element.value;
    else if (green) draft.greenParts[green] = element.value;
    else return;
    render();
  }
  $('calculator').addEventListener('input', update);
  $('calculator').addEventListener('change', update);
  $('calculator').addEventListener('submit', event => event.preventDefault());
  $('calculator').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.id === 'addGroup') {
      const id = String(nextGroup);
      nextGroup += 1;
      draft.groups.push({ id, count: '', age: draft.kind === 'nursery' ? 'under3' : 'older' });
      renderGroups();
      render();
      $(`count-${id}`).focus();
    } else if (button.dataset.remove) {
      draft.groups = draft.groups.filter(group => group.id !== button.dataset.remove);
      renderGroups();
      render();
      $('addGroup').focus();
    } else if (button.dataset.auto) {
      delete draft.overrides[button.dataset.auto];
      if (button.dataset.auto === 'site') siteEdit = null;
      render();
      $(`area-${button.dataset.auto}`).focus({ preventScroll: true });
    }
  });
  function report() {
    const rows = calc.reportRows(draft, calc.evaluate(draft));
    const inputs = Object.values(fields).flat().filter(([key]) => !$(`field-${key}`).hidden);
    rows.splice(1, 0, ...inputs.map(([key, label, type]) => [label, '', typeof type === 'object' ? type[draft[key]] : (type === 'check' ? (draft[key] ? 'Так' : 'Ні') : draft[key]), '', '', 'Вихідні дані']));
    current.areas.filter(row => row.land).forEach(row => rows.push([`${row.label}: озеленена частина, м²`, '', row.green, '', '', row.location === 'roof' ? 'Покрівля' : 'Земля']));
    return rows;
  }
  $('downloadCsv').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([calc.csv(report())], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'preschool-territory.csv';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('actionStatus').textContent = 'CSV містить поточний розрахунок та його обмеження.';
  });
  $('copyReport').addEventListener('click', async () => {
    const text = report().map(row => row.map(value => value ?? '—').join('\t')).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      $('actionStatus').textContent = 'Поточний розрахунок скопійовано.';
    } catch {
      $('manualCopy').value = text;
      $('manualCopy').hidden = false;
      $('manualCopy').focus();
      $('manualCopy').select();
      $('actionStatus').textContent = 'Автоматичне копіювання недоступне. Скопіюйте виділений текст вручну.';
    }
  });
  window.addEventListener('beforeprint', () => {
    render();
    const rows = report();
    $('printTable').innerHTML = `<thead><tr>${rows[0].map(label => `<th scope="col">${escape(label)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row => `<tr>${row.map(value => `<td>${escape(value ?? '—')}</td>`).join('')}</tr>`).join('')}</tbody>`;
  });
  $('printReport').addEventListener('click', () => window.print());
  renderGroups();
  render();
})();
