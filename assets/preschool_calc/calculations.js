(() => {
  'use strict';

  const norms = globalThis.PreschoolNorms;
  const round = value => Math.round((value + Number.EPSILON) * 1e6) / 1e6;
  function number(value, label, { min = 0, max = 1e9, integer = false } = {}) {
    const text = String(value ?? '').trim().replace(/[\s\u00a0\u202f]/g, '');
    if (!/^\d+(?:[.,]\d+)?$/.test(text)) throw new Error(`${label}: введіть число.`);
    const result = Number(text.replace(',', '.'));
    if (!Number.isFinite(result) || result < min || result > max || (integer && !Number.isInteger(result))) {
      throw new Error(`${label}: допустимо ${integer ? 'ціле ' : ''}число від ${min} до ${max}.`);
    }
    return result;
  }
  const optional = (value, label, options) => (String(value ?? '').trim() === '' ? null : number(value, label, options));
  function createDraft() {
    return JSON.parse(JSON.stringify(norms.defaults));
  }
  function evaluate(draft) {
    const result = { areas: [], checks: [], errors: [], groups: [], groupTotal: null, groupDifference: null,
      groupsComplete: false, small: null, site: null, green: null, balance: null, buildingPercent: null,
      ramp: null, roofUsed: 0, checkedOn: norms.checkedOn };
    const check = (section, label, status, detail, rule) => {
      result.checks.push({ section, label, status, detail, rule });
    };
    const guard = (section, action) => {
      try { return action(); } catch (error) {
        result.errors.push({ section, message: error.message });
        check(section, 'Вихідні дані', 'error', error.message, '');
        return null;
      }
    };
    const n = (key, label, options) => number(draft[key], label, options);
    const opt = (key, label, options) => optional(draft[key], label, options);
    function area(key, label, norm, rule, section, options = {}) {
      const row = { key, label, norm, actual: null, delta: null, status: 'incomplete', rule, section,
        land: options.land !== false, location: draft.locations[key] || 'ground', green: 0,
        complete: options.complete !== false, note: options.note || '', recommendation: !!options.recommendation };
      guard(section, () => {
        row.actual = Object.hasOwn(draft.overrides, key)
          ? number(draft.overrides[key], label, { min: key === 'site' ? 0.000001 : 0 }) : norm;
        row.delta = norm === null || row.actual === null ? null : round(row.actual - norm);
        if (!row.complete || row.actual === null) row.status = 'incomplete';
        else if (options.project) row.status = 'project';
        else if (row.recommendation) row.status = 'recommendation';
        else row.status = row.delta !== null && row.delta < -1e-6 ? 'fail' : 'calculated';
        if (row.land && !['ground', 'roof'].includes(row.location)) throw new Error(`${label}: оберіть розміщення.`);
        row.green = number(draft.greenParts[key] || '0', `${label}: озеленена частина`);
        if (row.actual !== null && row.green > row.actual) throw new Error(`${label}: озеленена частина перевищує площу.`);
      });
      if (result.errors.some(error => error.section === section && error.message.startsWith(`${label}:`))) {
        row.actual = null;
        row.status = 'error';
      }
      result.areas.push(row);
      return row;
    }
    function compare(section, key, label, minimum, rule, { maximum = null, strict = false, integer = false } = {}) {
      guard(section, () => {
        const actual = opt(key, label, { integer });
        let status = 'incomplete';
        if (actual !== null) status = (strict ? actual > minimum : actual >= minimum)
          && (maximum === null || actual <= maximum) ? 'pass' : 'fail';
        check(section, label, status, `Прийнято: ${actual ?? 'не введено'}; ${maximum === null ? 'мінімум' : 'діапазон'} ${minimum}${maximum === null ? '' : `–${maximum}`}.`, rule);
      });
    }
    const context = guard('general', () => {
      if (!Object.hasOwn(norms.kinds, draft.kind)) throw new Error('Оберіть тип закладу.');
      if (!['new', 'reconstruction', 'repair'].includes(draft.construction)) throw new Error('Оберіть вид будівництва.');
      if (!['detached', 'residential', 'public', 'attached'].includes(draft.placement)) throw new Error('Оберіть розміщення.');
      if (!['urban', 'rural'].includes(draft.settlement)) throw new Error('Оберіть тип населеного пункту.');
      const capacity = n('capacity', 'Місткість', { min: 1, integer: true, max: 100000 });
      return { capacity, special: draft.kind === 'special', small: capacity <= (draft.kind === 'special' ? 24 : 40) };
    });
    if (context) result.small = context.small;

    guard('groups', () => {
      result.groups = draft.groups.map((group, index) => {
        if (!Object.hasOwn(norms.ages, group.age)) throw new Error(`Група ${index + 1}: оберіть вік.`);
        const count = number(group.count, `Група ${index + 1}: дітей`, { min: 1, integer: true, max: 100000 });
        if (context && draft.kind === 'nursery' && group.age !== 'under3') throw new Error(`Група ${index + 1}: для ясел задайте вік до 3 років.`);
        return { ...group, count };
      });
      result.groupTotal = result.groups.reduce((sum, group) => sum + group.count, 0);
      result.groupDifference = context ? result.groupTotal - context.capacity : null;
      result.groupsComplete = !!context && result.groups.length > 0 && result.groupDifference === 0;
      check('groups', 'Комплектність складу груп', result.groupsComplete ? 'calculated' : 'incomplete',
        `У групах ${result.groupTotal}; місткість ${context?.capacity ?? 'не визначено'}; різниця ${result.groupDifference ?? '—'}.`, 'п. 5.6');
    });

    if (context) {
      const { capacity, special, small } = context;
      guard('site', () => {
        const rate = special ? 60 : (capacity <= 40 ? 50 : (capacity <= 80 ? 45 : 40));
        const base = !special && capacity <= 40 ? Math.max(2000, capacity * rate) : capacity * rate;
        if (!Object.hasOwn(norms.reductions, draft.reduction)) throw new Error('Оберіть підставу зменшення площі.');
        let reduction = 0;
        if (draft.reduction !== 'none') {
          const eligible = (draft.reduction === 'dense' && draft.construction === 'reconstruction' && draft.dense)
            || (draft.reduction === 'slope' && n('slope', 'Ухил ділянки', { max: 100 }) > 20)
            || (draft.reduction === 'built' && !special && draft.placement === 'residential');
          if (eligible && draft.reductionConfirmed) reduction = norms.reductions[draft.reduction];
          else check('site', 'Зменшення площі не застосовано', 'review', 'Потрібні застосовні умови та підтвердження підстави.', 'ДБН Б.2.2-12, дод. Е.4');
        }
        const row = area('site', 'Земельна ділянка', round(base * (1 - reduction)), 'ДБН Б.2.2-12, дод. Е.4; п. 6.1.3', 'site', { land: false,
          recommendation: true, note: `${rate} м²/місце; базова площа ${base} м²; зменшення ${reduction * 100} %. Додаток Е.4 — довідковий.` });
        if (row.actual === 0) throw new Error('Площа ділянки: має бути більшою за нуль.');
        result.site = row.actual;
        if (draft.noSite) check('site', 'Варіант без окремої території', 'review',
          !special && small && draft.placement !== 'detached'
            ? 'П. 6.1.1 допускає виняток лише за умов використання іншого майданчика. Потрібне окреме обґрунтування; базовий розрахунок збережено.'
            : 'Виняток п. 6.1.1 для заданого типу або місткості не застосовується.', 'п. 6.1.1, 6.3.1');
      });

      if (!small) {
        result.groups.forEach((group, index) => {
          area(`group-${group.id}`, `Груповий майданчик ${index + 1}`, round(group.count * norms.groupRate[draft.kind]),
            'п. 6.2.3–6.2.7, табл. А.1', 'play', { complete: result.groupsComplete,
              note: `${group.count} × ${norms.groupRate[draft.kind]} м². ${group.age === 'under3' && !special ? 'Потрібне трав’яне покриття.' : ''}` });
          area(`shade-${group.id}`, `Тіньовий навіс ${index + 1}`, special ? 30 : group.count * 2,
            'п. 6.2.8–6.2.9, табл. А.1', 'play', { complete: result.groupsComplete,
              note: 'Окремо від майданчика; на землі враховується лише додаткова проєкція поза площею основної будівлі.' });
        });
        if (!result.groups.length) check('play', 'Групові майданчики та навіси', 'incomplete', 'Додайте склад груп.', 'п. 6.2.3–6.2.8');
        const two = capacity > (special ? 90 : 160) && draft.kind !== 'nursery';
        if (draft.stadium && draft.kind === 'garden' && two) {
          area('stadium', 'Дитячий міністадіон', 400, 'п. 6.2.10', 'play', { complete: result.groupsComplete });
        } else {
          const bands = two ? ['young', 'older'] : ['all'];
          bands.forEach(band => {
            const applicable = result.groups.filter(group => band === 'all'
              || (band === 'young' ? (special ? ['under3', 'three'].includes(group.age) : group.age === 'under3')
                : (special ? group.age === 'older' : ['three', 'older'].includes(group.age))));
            const ambiguous = band !== 'all' && result.groups.some(group => group.age === 'mixed');
            const ready = result.groupsComplete && applicable.length > 0 && !ambiguous;
            const count = applicable.length ? Math.max(...applicable.map(group => group.count)) : null;
            area(`sport-${band}`, `Фізкультурний майданчик${band === 'all' ? '' : (band === 'young' ? ' молодших' : ' старших')}`,
              ready ? round(count * norms.sportRate[draft.kind]) : null, 'п. 6.2.10–6.2.13, табл. А.1', 'play',
              { complete: ready, note: `Найбільша група одночасного користування × ${norms.sportRate[draft.kind]} м². Табличні загальні площі — рекомендації. Для різновікових груп потрібне уточнення розподілу.` });
          });
        }
      } else {
        const rate = special ? 30 : (draft.compactSmall && draft.dense ? 7 : 10);
        const groups = draft.separateSmall ? result.groups : [{ id: 'shared', count: capacity }];
        groups.forEach((group, index) => area(`small-${group.id}`,
          `${special ? 'Універсальний фізкультурно-ігровий' : 'Спортивно-ігровий'} майданчик${draft.separateSmall ? ` ${index + 1}` : ''}`,
          group.count * rate, 'п. 6.3.1–6.3.2, табл. А.2', 'play',
          { complete: !draft.separateSmall || result.groupsComplete,
            note: `${group.count} × ${rate} м²; зонування та склад визначаються завданням на проєктування. Для універсального майданчика навіс входить до зонування, окремо не додається.` }));
        if (draft.separateSmall && !groups.length) check('play', 'Окремі майданчики', 'incomplete', 'Додайте склад груп.', 'табл. А.2');
      }

      ['ecology', 'naturalists'].filter(key => draft[key]).forEach(key => {
        const count = result.groups.filter(group => group.age === 'older').reduce((sum, group) => sum + group.count, 0);
        const ready = result.groupsComplete && !result.groups.some(group => group.age === 'mixed');
        if (small) check('extras', 'Пізнавальні осередки', 'review', 'Показник п. 6.2.25 стосується закладів великої категорії; для малого закладу площу задайте вручну.', 'п. 6.2.25');
        area(key, key === 'ecology' ? 'Екологічна стежина' : 'Юні натуралісти', ready && !small ? count * 0.75 : null,
          'п. 6.2.25', 'extras', { complete: ready || small, project: small, recommendation: !small,
            note: '0,75 м² на вихованця від 4 до 8 років; різновікові групи потребують уточнення. Ділянки осередків не мають перекриватися.' });
      });
      if (draft.zoo) area('zoo', 'Зоокуточок', small ? null : 30, 'п. 6.2.25', 'extras', { recommendation: true, project: small });
      if (draft.orientation && special) area('orientation', 'Майданчик орієнтування', null, 'п. 6.2.22', 'extras',
        { project: true, note: 'Площу й обладнання визначає завдання з урахуванням сенсорних труднощів.' });
      if (draft.events) area('events', 'Майданчик заходів', null, 'п. 6.2.24', 'extras', { project: true,
        note: 'Площу задайте за завданням; передбачте відокремлення від проїздів і паркування.' });
      area('household', 'Господарська зона', capacity <= 40 ? 70 : (capacity <= 120 ? 100 : 150), 'п. 6.1.8–6.1.10', 'household',
        { note: 'Включає контейнерний майданчик, місце сушіння ≥15 м² та інші господарські елементи; не додавайте їх повторно. Окремий в’їзд і тверде покриття. Зарядки електромобілів тут заборонені.' });
      check('household', 'Інженерні та місцеві умови', 'review', 'За відсутності централізованих мереж у селах/селищах площа може потребувати збільшення за завданням.', 'п. 6.1.8');
    }

    guard('building', () => {
      const footprint = opt('footprint', 'Площа забудови');
      result.footprint = footprint;
      if (footprint === null) check('building', 'Площа забудови', 'incomplete', 'Введіть проєкцію основної будівлі; вона не визначається з кількості поверхів.', 'Баланс площ');
      if (footprint !== null && result.site) result.buildingPercent = round(100 * footprint / result.site);
      if (!context) return;
      const floors = n('floors', 'Кількість поверхів', { min: 1, max: 100, integer: true });
      let status = floors <= 2 ? 'calculated' : 'fail';
      let detail = context.special ? 'Спеціальний садок: не вище 2 поверхів; вогнестійкість не нижче II.' : 'Окрема будівля: базово 2 поверхи; третій поверх допускається за додаткових умов.';
      if (!context.special && draft.placement === 'detached' && floors === 3 && !draft.seismic && draft.construction === 'new') {
        const radius = opt('fireRadius', 'Відстань до пожежного підрозділу');
        status = draft.fireLadder === 'yes' && radius !== null && radius <= 3 ? 'review' : (radius === null || draft.fireLadder === 'unknown' ? 'incomplete' : 'fail');
        detail += ' Потрібні автодрабина в радіусі виїзду ≤3 км, СО4 та перевірка п. 9.3, 9.7, 9.10.';
      }
      if (draft.placement !== 'detached') {
        if (floors > 2) status = 'fail';
        else status = 'review';
        detail = 'Перевіряється верхній поверх розміщення ЗДО, а не поверховість усього будинку. Протипожежне відокремлення та виходи перевіряються окремо.';
        if (!context.small && ['residential', 'public'].includes(draft.placement)) {
          const maximum = draft.placement === 'residential' ? (draft.kind === 'garden' ? 120 : 90)
            : ({ nursery: 120, garden: 160, special: 90 }[draft.kind]);
          check('building', 'Місткість у складі іншої будівлі', context.capacity > maximum ? 'fail' : 'review', `Гранична місткість ${maximum}; також діють інші умови розміщення.`, 'п. 7.1.2–7.1.3');
        }
      }
      if (context.special && !['I', 'II'].includes(draft.fireClass)) status = draft.fireClass === 'unknown' ? 'incomplete' : 'fail';
      check('building', 'Поверховість і розміщення', status, detail, 'п. 7.1.2–7.1.5');
    });

    return finish(draft, result, context, { guard, check, compare, area, n, opt });
  }

  function finish(draft, result, context, helpers) {
    const { guard, check, compare, area, n, opt } = helpers;
    const landRows = result.areas.filter(row => row.land);
    guard('green', () => {
      if (!result.site) throw new Error('Спочатку задайте коректну площу ділянки.');
      if (landRows.some(row => row.actual === null)) throw new Error('Уточніть площі активних майданчиків і зон.');
      const embedded = landRows.reduce((sum, row) => sum + row.green, 0);
      const roofGreen = n('roofGreen', 'Інше озеленення на покрівлі');
      const roofArea = opt('roofArea', 'Доступна площа покрівлі');
      const roofEmbedded = landRows.filter(row => row.location === 'roof').reduce((sum, row) => sum + row.green, 0);
      if (roofGreen > 0 && roofArea === null) throw new Error('Для озеленення на покрівлі задайте її доступну площу.');
      if (roofArea !== null && roofGreen + roofEmbedded > roofArea) throw new Error('Озеленення покрівлі перевищує її доступну площу.');
      const minimum = round(result.site * 0.25);
      const free = area('greenFree', 'Окреме озеленення на землі', round(Math.max(0, minimum - embedded - roofGreen)),
        'п. 6.1.4', 'green', { note: 'Не включає озеленені частини інших зон та покрівлі: вони враховані окремо.' });
      if (free.actual !== null) {
        const total = round(free.actual + embedded + roofGreen);
        result.green = { minimum, total, free: free.actual, embedded, roof: round(roofGreen + roofEmbedded),
          percent: round(total / result.site * 100), delta: round(total - minimum) };
        check('green', 'Загальне озеленення', landRows.some(row => !row.complete) ? 'incomplete' : (total + 1e-6 >= minimum ? 'calculated' : 'fail'),
          `${total} м²; ${result.green.percent} %; мінімум ${minimum} м². Площі враховано без накладання.`, 'п. 6.1.4');
      }
    });
    guard('balance', () => {
      const active = result.areas.filter(row => row.land);
      const playMissing = !context || (!context.small && !result.groupsComplete)
        || (context.small && draft.separateSmall && !result.groupsComplete);
      if (!result.site || result.footprint === null || result.footprint === undefined || !result.green
        || playMissing || active.some(row => row.actual === null || !row.complete)) {
        throw new Error('Баланс неповний: потрібні площа ділянки, забудова та коректні площі всіх активних зон.');
      }
      const paths = n('paths', 'Додаткові проїзди та доріжки');
      const other = n('otherLand', 'Інша зайнята земля');
      const ground = active.filter(row => row.location === 'ground');
      const used = round(result.footprint + paths + other + ground.reduce((sum, row) => sum + row.actual, 0));
      result.balance = { used, remaining: round(result.site - used), paths, other,
        roof: round(active.filter(row => row.location === 'roof').reduce((sum, row) => sum + row.actual, 0)) };
      check('balance', 'Баланс землі', result.balance.remaining >= -1e-6 ? 'calculated' : 'fail',
        `Зайнято ${used} м²; залишок ${result.balance.remaining} м². Це арифметичний баланс без автоматичного компонування.`, 'Сума неперекривних проєкцій на землю');
    });
    if (context) {
      compare('distances', 'redline', 'Відступ від червоної лінії, м', 25, 'п. 6.1.6');
      if (draft.settlement === 'rural' && draft.ruralBasis.trim()) check('distances', 'Сільський відступ', 'review', `Потрібна перевірка містобудівного обґрунтування: ${draft.ruralBasis}`, 'п. 6.1.6');
      compare('distances', 'playDistance', 'Від майданчиків до житла / житлових вікон, м', 12, 'п. 6.1.7');
      compare('distances', 'serviceDistance', 'Від контейнерного майданчика / гаража до ЗДО, м', draft.construction === 'reconstruction' ? 20 : 25, 'п. 6.1.10');
      compare('distances', 'fireWidth', 'Ширина пожежного під’їзду, м', 3.5, 'п. 6.1.6');
      compare('distances', 'fence', 'Висота огорожі території, м', 1.6, 'п. 6.1.5');
      if (draft.placement === 'detached') check('distances', 'Круговий пожежний проїзд',
        draft.ring === 'unknown' ? 'incomplete' : (draft.ring === 'yes' ? 'pass' : 'fail'), 'Потрібен для окремо розташованого закладу.', 'п. 6.1.6');
      check('distances', 'Від будівлі ЗДО до сусідніх будинків', 'review',
        'Визначається за інсоляцією, освітленістю та протипожежними вимогами; приймається більша застосовна відстань. 12 м для майданчиків не замінюють цю перевірку.', 'п. 6.1.6; ДБН Б.2.2-12; ДСП 173');
    }
    const roofRows = result.areas.filter(row => row.land && row.location === 'roof');
    result.roofUsed = roofRows.some(row => row.actual === null) ? null : round(roofRows.reduce((sum, row) => sum + row.actual, 0));
    if (roofRows.length || draft.roofGreen !== '0') {
      guard('roof', () => {
        const available = opt('roofArea', 'Доступна площа покрівлі');
        const green = n('roofGreen', 'Інше озеленення на покрівлі');
        check('roof', 'Площа покрівлі', available === null || result.roofUsed === null ? 'incomplete'
          : (available + 1e-6 >= result.roofUsed + green ? 'calculated' : 'fail'),
        `Зони ${result.roofUsed ?? '—'} м² + інше озеленення ${green} м²; доступно ${available ?? '—'} м².`, 'Баланс покрівлі');
        if (!roofRows.length) return;
        if (context?.special) check('roof', 'Спеціальний садок', 'review', 'Дозвіл п. 6.2.15–6.2.16 прямо стосується ясел і дитячих садків; застосування до спеціального садка потребує уточнення.', 'п. 6.2.15–6.2.16');
        roofRows.filter(row => row.key.startsWith('group-')).forEach(row => {
          const group = result.groups.find(item => row.key === `group-${item.id}`);
          check('roof', row.label, group?.age === 'older' ? 'review' : 'fail', 'Груповий майданчик на покрівлі допускається для дітей від 4 років за сукупністю умов.', 'п. 6.2.15');
        });
      });
      if (roofRows.length) {
        guard('roof', () => {
          const height = opt('roofHeight', 'Висота майданчика');
          check('roof', 'Висота розміщення, м', height === null ? 'incomplete' : (height <= 5 ? 'pass' : 'fail'), `Прийнято ${height ?? '—'}; не більше 5 м.`, 'п. 6.2.15–6.2.16');
          const gap = opt('roofGap', 'Просвіт огородження покрівлі');
          check('roof', 'Просвіт вертикальних елементів, м', gap === null ? 'incomplete' : (gap < 0.1 ? 'pass' : 'fail'), `Прийнято ${gap ?? '—'}; менше 0,1 м. Для перфорованих панелей потрібне окреме підтвердження.`, 'п. 6.2.18');
        });
        compare('roof', 'roofFence', 'Висота огородження покрівлі, м', 1.6, 'п. 6.2.15–6.2.18');
        compare('roof', 'roofExits', 'Незалежні евакуаційні шляхи', 2, 'п. 6.2.17', { integer: true });
        if (roofRows.some(row => /^(sport-|stadium|small-)/.test(row.key))) compare('roof', 'roofNet', 'Висота захисної сітки, м', 3, 'п. 6.2.16');
        check('roof', 'Інші умови покрівлі', draft.roofConditions === 'no' ? 'fail' : 'review',
          'Потрібні перевірки несучої здатності, евакуації, затінення, захисту від опадів, нелазійного негорючого огородження та безпечних зв’язків. Самодекларація не є повною перевіркою.', 'п. 6.2.15–6.2.21');
      }
    }
    if (draft.access) {
      guard('access', () => {
        const width = opt('pathWidth', 'Ширина доріжки');
        const length = opt('pathLength', 'Довжина звуженої ділянки');
        let status = 'incomplete';
        if (width !== null) {
          if (width >= 1.8) status = 'pass';
          else if (width >= 1.2 && length !== null && length <= 25) status = 'review';
          else if (draft.construction === 'repair' && width >= 0.9 && length !== null && length <= 15) status = 'review';
          else status = length === null && width >= 1.2 ? 'incomplete' : 'fail';
        }
        check('access', 'Ширина основного пішохідного шляху', status, 'До центрального входу та групових виходів ≥1,8 м; інші доріжки ≥1,5 м. Умовні звуження перевіряються окремо.', 'п. 6.4.7–6.4.8');
      });
      compare('access', 'pathSlope', 'Поздовжній ухил доріжки, %', 0, 'п. 6.4.6', { maximum: 5 });
      compare('access', 'pathCross', 'Поперечний ухил доріжки, %', 1, 'п. 6.4.6', { maximum: 2 });
      if (draft.ramp) {
        guard('access', () => {
          const rise = n('rampRise', 'Перепад висоти', { min: 0.001, max: 100 });
          const slope = n('rampSlope', 'Ухил пандуса', { min: 0.01, max: 100 });
          const length = round(rise * 100 / slope);
          const flights = Math.max(1, Math.ceil(length / 9));
          result.ramp = { length, flights, intermediate: flights - 1, handrails: slope > 5 };
          check('access', 'Ухил і довжина пандуса', slope > 8 ? 'fail' : (draft.construction === 'new' ? 'review' : 'calculated'),
            `L = Δh × 100 / i = ${length} м; підйомів не менше ${flights}; проміжних площадок ${flights - 1}. Один підйом ≤9 м. Нове будівництво додатково перевіряється за дод. Д ДБН В.2.2-40; 8 % і 1:12 не ототожнюються.`, 'п. 6.4.13');
        });
        compare('access', 'rampWidth', 'Ширина пандуса у просвіті, м', draft.construction === 'new' ? 1.2 : 0.9, 'п. 6.4.13');
        compare('access', 'rampLanding', 'Глибина горизонтальної площадки, м', 1.5, 'п. 6.4.13');
      }
      if (draft.stairs) {
        compare('access', 'stairWidth', 'Ширина маршу, м', 1.35, 'п. 6.4.10');
        compare('access', 'tread', 'Глибина сходинки, м', 0.3, 'п. 6.4.10', { maximum: 0.36 });
        guard('access', () => {
          const riser = opt('riser', 'Висота сходинки');
          check('access', 'Висота сходинки', 'review', `Прийнято: ${riser ?? 'не введено'} м. В оприлюдненому тексті п. 6.4.10 є стороння вставка в діапазоні висоти; автоматичний висновок не формується.`, 'п. 6.4.10');
        });
        compare('access', 'stairCross', 'Поперечний ухил сходинок, %', 1, 'п. 6.4.10', { maximum: 2 });
      }
      if (draft.stairs || draft.ramp) {
        guard('access', () => {
          const height = opt('outdoorHeight', 'Висота відкритої площадки / сходів');
          if (height === null) check('access', 'Огородження відкритих елементів', 'incomplete', 'Задайте висоту відкритого елемента.', 'п. 6.4.18');
          if (height !== null && height > 0.2) {
            compare('access', 'outdoorFence', 'Висота зовнішнього огородження, м', 1.3, 'п. 6.4.18');
            const gap = opt('outdoorGap', 'Просвіт зовнішнього огородження');
            check('access', 'Просвіт огородження', gap === null ? 'incomplete' : (gap < 0.1 ? 'pass' : 'fail'), 'Вертикальні елементи: просвіт <0,1 м; горизонтальне членування заборонене.', 'п. 6.4.18');
          }
        });
        compare('access', 'handLow', 'Нижній поручень, м', 0.6, 'п. 6.4.19', { maximum: 0.7 });
        compare('access', 'handHigh', 'Верхній поручень, м', 0.8, 'п. 6.4.19', { maximum: 0.9 });
        compare('access', 'handDiameter', 'Діаметр поручня, см', 3.5, 'п. 6.4.19', { maximum: 4.5 });
        compare('access', 'handExtension', 'Горизонтальне продовження поручня, м', 0.3, 'п. 6.4.19');
        check('access', 'Конструкція та безпека', 'review', 'Додатково перевіряються поручні з обох боків, безперервність, шорсткість, контраст, бортики пандуса ≥0,05 м та розділові поручні сходів від 4 м.', 'п. 6.4.10–6.4.19');
      }
    }
    if (context?.special && context.capacity >= 24) check('dropoff', 'Майданчик посадки-висадки',
      draft.dropoff ? 'review' : (draft.construction === 'new' ? 'review' : 'recommendation'),
      'П. 6.4.2 містить перетин обов’язкової та рекомендованої категорій від 24 до 40 вихованців. Потрібне уточнення застосовності; відсутність не позначається підтвердженим виконанням.', 'п. 6.4.2');
    if (draft.dropoff) {
      if (context?.special) {
        compare('dropoff', 'dropWidth', 'Ширина посадки-висадки, м', 3.5, 'п. 6.4.2');
        compare('dropoff', 'dropLength', 'Довжина посадки-висадки, м', 9, 'п. 6.4.2');
      } else guard('dropoff', () => {
        const width = opt('dropWidth', 'Ширина посадки-висадки');
        const length = opt('dropLength', 'Довжина посадки-висадки');
        check('dropoff', 'Розміри посадки-висадки', width === null || length === null ? 'incomplete' : 'project', `Прийнято ${width ?? '—'} × ${length ?? '—'} м; визначаються завданням. Площу врахуйте один раз у проїздах або госпзоні.`, 'п. 6.4.2–6.4.4');
      });
    }
    if (draft.construction === 'repair') check('general', 'Капітальний ремонт', 'review', 'Загальні показники показано як орієнтир; обсяг застосування визначається завданням. Вимоги інклюзивності / розумного пристосування обов’язкові.', 'п. 1.3');
    return result;
  }
  function reportRows(draft, result) {
    const rows = [['Показник', 'Розрахунок / норма', 'Прийнято', 'Різниця', 'Статус', 'Підстава / пояснення']];
    rows.push(['Об’єкт', '', draft.name, '', '', ''], ['Тип закладу', '', norms.kinds[draft.kind] || '—', '', '', ''],
      ['Місткість', '', draft.capacity, '', '', ''], ['Склад груп', '', draft.groups.map(group => `${group.count}; ${norms.ages[group.age]}`).join(' | '), '', '', '']);
    result.areas.forEach(row => rows.push([`${row.label}, м²`, row.norm, row.actual, row.delta,
      norms.statuses[row.status], `${row.rule}; ${row.note}; ${row.land ? (row.location === 'roof' ? 'покрівля' : 'земля') : ''}`]));
    rows.push(['Забудова, м²', '', result.footprint ?? '', '', '', 'Прийнята проєкція основної будівлі'],
      ['Частка забудови, %', '', result.buildingPercent, '', '', '']);
    if (result.green) rows.push(['Озеленення загалом, м²', result.green.minimum, result.green.total, result.green.delta, '', 'п. 6.1.4']);
    if (result.balance) rows.push(['Зайнято землі, м²', '', result.balance.used, '', '', ''], ['Залишок землі, м²', '', result.balance.remaining, '', '', '']);
    result.checks.forEach(item => rows.push([item.label, '', '', '', norms.statuses[item.status], `${item.rule}; ${item.detail}`]));
    rows.push(['Нормативна база', '', norms.checkedOn, '', '', norms.source], ['ДБН Б.2.2-12', '', '', '', '', norms.planningText],
      ['Картка ДБН Б.2.2-12', '', '', '', '', norms.planning],
      ['Обмеження', '', '', '', '', 'Перевірено лише реалізовані показники; без компонування, інсоляції, конструктивного розрахунку та внутрішніх приміщень.']);
    return rows;
  }
  const csvCell = value => {
    const text = typeof value === 'number' ? String(value).replace('.', ',') : String(value ?? '');
    return `"${(typeof value !== 'number' && /^[=+\-@\t\r]/.test(text) ? `'${text}` : text).replace(/"/g, '""')}"`;
  };
  globalThis.PreschoolCalc = Object.freeze({ number, optional, createDraft, evaluate, reportRows,
    csv: rows => `\uFEFF${rows.map(row => row.map(csvCell).join(';')).join('\r\n')}` });
})();
