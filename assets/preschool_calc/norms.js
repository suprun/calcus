(() => {
  'use strict';

  globalThis.PreschoolNorms = Object.freeze({
    checkedOn: '08.11.2026',
    source: 'https://deponms.carpathia.gov.ua/uploads/zvit-derektoriv-PTNZ/DBN6.pdf',
    planning: 'https://e-construction.gov.ua/laws_detail/3874277768581612585',
    planningText: 'https://e-construction.gov.ua/files/new_doc/3719055419235108718/2025-09-11/22ff55dc-33a1-49b6-bfe0-0ed8793e1dbc.pdf',
    kinds: { nursery: 'Ясла', garden: 'Дитячий садок', special: 'Спеціальний дитячий садок' },
    ages: { under3: 'До 3 років', three: 'Від 3 до 4 років', older: 'Від 4 років', mixed: 'Різновікова група' },
    groupRate: { nursery: 7.5, garden: 7.5, special: 12 },
    sportRate: { nursery: 13.5, garden: 13.5, special: 20 },
    reductions: { none: 0, dense: 0.2, slope: 0.15, built: 0.1 },
    statuses: {
      pass: 'Виконано за введеними даними', fail: 'Не виконано', review: 'Потребує уточнення',
      calculated: 'Розраховано', recommendation: 'Рекомендація', incomplete: 'Неповні дані',
      error: 'Помилка введення', project: 'За завданням на проєктування',
    },
    defaults: {
      name: '', kind: 'garden', capacity: '80', construction: 'new', placement: 'detached',
      settlement: 'urban', dense: false, slope: '0', reduction: 'none', reductionConfirmed: false,
      siteUnit: 'sqm', noSite: false, floors: '2', footprint: '',
      seismic: false, fireLadder: 'unknown', fireRadius: '', fireClass: 'II',
      stadium: false, separateSmall: false, compactSmall: false,
      ecology: false, naturalists: false, zoo: false, orientation: false, events: false,
      paths: '0', otherLand: '0', roofArea: '', roofGreen: '0',
      redline: '', ruralBasis: '', playDistance: '', serviceDistance: '', fireWidth: '',
      ring: 'unknown', fence: '', roofHeight: '', roofFence: '', roofGap: '', roofNet: '',
      roofExits: '', roofConditions: 'unknown',
      access: false, pathWidth: '', pathLength: '', pathSlope: '', pathCross: '',
      ramp: false, rampRise: '', rampSlope: '5', rampWidth: '', rampLanding: '',
      stairs: false, stairWidth: '', tread: '', riser: '', stairCross: '',
      outdoorHeight: '', outdoorFence: '', outdoorGap: '', handLow: '', handHigh: '',
      handDiameter: '', handExtension: '', dropoff: false, dropWidth: '', dropLength: '',
      groups: [], overrides: {}, locations: {}, greenParts: {},
    },
  });
})();
