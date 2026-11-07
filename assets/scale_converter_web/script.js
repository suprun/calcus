const units = [
      { id: 'mm', label: 'мм', name: 'міліметри', toM: 0.001, aliases: ['мм', 'mm', 'міліметр', 'міліметри'] },
      { id: 'cm', label: 'см', name: 'сантиметри', toM: 0.01, aliases: ['см', 'cm', 'сантиметр', 'сантиметри'] },
      { id: 'm', label: 'м', name: 'метри', toM: 1, aliases: ['м', 'm', 'метр', 'метри'] },
      { id: 'km', label: 'км', name: 'кілометри', toM: 1000, aliases: ['км', 'km', 'кілометр', 'кілометри'] },
      { id: 'in', label: 'дюйм', name: 'дюйми', toM: 0.0254, aliases: ['дюйм', 'дюйми', 'in', 'inch', 'inches'] },
      { id: 'ft', label: 'фут', name: 'фути', toM: 0.3048, aliases: ['фут', 'фути', 'ft', 'feet'] },
      { id: 'yd', label: 'ярд', name: 'ярди', toM: 0.9144, aliases: ['ярд', 'ярди', 'yd', 'yard', 'yards'] },
      { id: 'mi', label: 'миля', name: 'милі', toM: 1609.344, aliases: ['миля', 'милі', 'mile', 'miles', 'mi'] },
      { id: 'nmi', label: 'мор. миля', name: 'морські милі', toM: 1852, aliases: ['морська', 'морські', 'nmi', 'nautical'] }
    ];

    const $ = (id) => document.getElementById(id);
    const els = {
      preset: $('preset'), scaleA: $('scaleA'), scaleB: $('scaleB'), invertBtn: $('invertBtn'),
      realValue: $('realValue'), realUnit: $('realUnit'), drawingValue: $('drawingValue'), drawingUnit: $('drawingUnit'),
      swapUnitsBtn: $('swapUnitsBtn'), copyResultBtn: $('copyResultBtn'), copyLinkBtn: $('copyLinkBtn'), clearBtn: $('clearBtn'), themeBtn: $('themeBtn'),
      resultMain: $('resultMain'), resultSub: $('resultSub'), resultFlipBtn: $('resultFlipBtn'), formulaBox: $('formulaBox'),
      realBar: $('realBar'), drawingBar: $('drawingBar'), realBarText: $('realBarText'), drawingBarText: $('drawingBarText'), toast: $('toast')
    };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let source = 'real';
    let resultDirection = 'drawing-first';
    let lock = false;
    let listeningButton = null;
    let stepRepeatTimer = null;
    let stepRepeatInterval = null;
    let manualTheme = false;

    function populateUnits() {
      const html = units.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
      els.realUnit.innerHTML = html;
      els.drawingUnit.innerHTML = html;
      els.realUnit.value = 'm';
      els.drawingUnit.value = 'cm';
    }

    function parseNumber(value) {
      const normalized = String(value ?? '').trim().replace(/\s+/g, '').replace(',', '.');
      if (!normalized || normalized === 'any') return NaN;
      return Number(normalized);
    }
function clampNonNegativeInput(input, minValue = 0) {
  const value = parseNumber(input.value);

  if (input.value === '' || !Number.isFinite(value)) return;

  if (value < minValue) {
    input.value = inputFormat(minValue);
  }
}
function isBlankInput(input) {
  return String(input.value ?? '').trim() === '';
}
function clearCalculatedDisplay(message = 'Введіть одну з довжин') {
  updateBars();
  els.resultMain.textContent = '—';
  els.resultSub.textContent = message;
  els.formulaBox.textContent = '—';
  writeUrl(false);
}
function blockInvalidNumberChars(input) {
  const blockedKeys = ['-', '+', 'e', 'E'];





  input.addEventListener('keydown', (event) => {
    if (blockedKeys.includes(event.key)) {
      event.preventDefault();
    }
  });

  input.addEventListener('beforeinput', (event) => {
    if (event.data && /[-+eE]/.test(event.data)) {
      event.preventDefault();
    }
  });

  input.addEventListener('paste', (event) => {
    const text = event.clipboardData.getData('text');

    if (/[-+eE]/.test(text)) {
      event.preventDefault();
    }
  });
}
    function unit(id) { return units.find(u => u.id === id) || units[0]; }
    function unitLabel(id) { return unit(id).label; }
    function toMeters(value, unitId) { return value * unit(unitId).toM; }
    function fromMeters(value, unitId) { return value / unit(unitId).toM; }

    function currentScale() {
      const a = parseNumber(els.scaleA.value);
      const b = parseNumber(els.scaleB.value);
      if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) throw new Error('Перевірте масштаб A:B');
      return { a, b };
    }

    function nice(value, maxDigits = 6) {
      if (!Number.isFinite(value)) return '—';
      const abs = Math.abs(value);
      if (abs !== 0 && (abs >= 1e9 || abs < 1e-6)) return value.toExponential(4);
      return new Intl.NumberFormat('uk-UA', { maximumFractionDigits: maxDigits, useGrouping: true }).format(Number(value.toPrecision(12)));
    }

    function inputFormat(value) {
      if (!Number.isFinite(value)) return '';
      const abs = Math.abs(value);
      if (abs !== 0 && abs < 0.000001) return value.toExponential(6);
      return Number(value.toPrecision(12)).toString();
    }

    function scaleText() {
      const { a, b } = currentScale();
      return `${nice(a, 6)}:${nice(b, 6)}`.replace(/\s/g, '');
    }

    function convertFromReal() {
      const { a, b } = currentScale();
      const real = parseNumber(els.realValue.value);
      if (!Number.isFinite(real)) throw new Error('Введіть реальну довжину');
      return fromMeters(toMeters(real, els.realUnit.value) * a / b, els.drawingUnit.value);
    }

    function convertFromDrawing() {
      const { a, b } = currentScale();
      const drawing = parseNumber(els.drawingValue.value);
      if (!Number.isFinite(drawing)) throw new Error('Введіть довжину на кресленні');
      return fromMeters(toMeters(drawing, els.drawingUnit.value) * b / a, els.realUnit.value);
    }

    function updatePreset() {
      let text;
      try { text = scaleText(); } catch { return; }
      const option = Array.from(els.preset.options).find(o => o.value === text);
      els.preset.value = option ? text : 'custom';
    }

    function resultSentence() {
      const real = parseNumber(els.realValue.value);
      const drawing = parseNumber(els.drawingValue.value);
      const realText = `${nice(real)} ${unitLabel(els.realUnit.value)}`;
      const drawingText = `${nice(drawing)} ${unitLabel(els.drawingUnit.value)}`;
      const scale = scaleText();
      if (!Number.isFinite(real) || !Number.isFinite(drawing)) return '—';
      if (resultDirection === 'real-first') return `${realText} у реальному розмірі = ${drawingText} у масштабі ${scale}`;
      return `${drawingText} на кресленні = ${realText} у масштабі ${scale}`;
    }

    function resultSentenceHtml() {
      const real = parseNumber(els.realValue.value);
      const drawing = parseNumber(els.drawingValue.value);
      const realHtml = `<span class="result-value real">${nice(real)} ${unitLabel(els.realUnit.value)}</span>`;
      const drawingHtml = `<span class="result-value drawing">${nice(drawing)} ${unitLabel(els.drawingUnit.value)}</span>`;
      const scale = scaleText();
      if (!Number.isFinite(real) || !Number.isFinite(drawing)) return '—';
      if (resultDirection === 'real-first') return `${realHtml} у реальному розмірі = <span class="result-chip-gap"></span>${drawingHtml}<span class="result-nowrap"></span> <span class="result-nowrap">у масштабі ${scale}</span>`;
      return `${drawingHtml} <span class="result-nowrap">на кресленні</span> = <span class="result-chip-gap"></span>${realHtml} <span class="result-nowrap">у масштабі ${scale}</span>`;
    }

    function renderResult(formula) {
      els.resultMain.innerHTML = resultSentenceHtml();
      els.resultSub.textContent = '';
      els.formulaBox.innerHTML = `<code>${formula}</code>`;
    }

    function calculate() {
      if (source === 'real' && isBlankInput(els.realValue)) {
  els.drawingValue.value = '';
  clearCalculatedDisplay();
  return;
}

if (source === 'drawing' && isBlankInput(els.drawingValue)) {
  els.realValue.value = '';
  clearCalculatedDisplay();
  return;
}
      if (lock) return;
      lock = true;
      try {
        const sc = currentScale();
        let formula;
        if (source === 'real') {
          const resultValue = convertFromReal();
          els.drawingValue.value = inputFormat(resultValue);
          formula = `креслення = реальна × A / B = ${nice(parseNumber(els.realValue.value))} ${unitLabel(els.realUnit.value)} × ${nice(sc.a)} / ${nice(sc.b)}`;
        } else {
          const resultValue = convertFromDrawing();
          els.realValue.value = inputFormat(resultValue);
          formula = `реальна = креслення × B / A = ${nice(parseNumber(els.drawingValue.value))} ${unitLabel(els.drawingUnit.value)} × ${nice(sc.b)} / ${nice(sc.a)}`;
        }
        renderResult(formula);
        updateBars();
        updatePreset();
        writeUrl(false);
      } catch (error) {
        els.resultMain.textContent = '—';
        els.resultSub.textContent = error.message || 'Неможливо виконати розрахунок';
        els.formulaBox.textContent = '—';
      } finally {
        lock = false;
      }
    }

    function updateBars() {
      const realInput = parseNumber(els.realValue.value);
      const drawingInput = parseNumber(els.drawingValue.value);
      els.realBarText.textContent = Number.isFinite(realInput) ? `${nice(realInput)} ${unitLabel(els.realUnit.value)}` : '—';
      els.drawingBarText.textContent = Number.isFinite(drawingInput) ? `${nice(drawingInput)} ${unitLabel(els.drawingUnit.value)}` : '—';
      const realM = Number.isFinite(realInput) ? Math.abs(toMeters(realInput, els.realUnit.value)) : 0;
      const drawingM = Number.isFinite(drawingInput) ? Math.abs(toMeters(drawingInput, els.drawingUnit.value)) : 0;
      const max = Math.max(realM, drawingM);
      if (!Number.isFinite(max) || max <= 0) {
        els.realBar.style.width = '0%';
        els.drawingBar.style.width = '0%';
        return;
      }
      els.realBar.style.width = `${Math.min(100, realM / max * 100)}%`;
      els.drawingBar.style.width = `${Math.min(100, drawingM / max * 100)}%`;
    }

    function setPreset(value) {
      if (value === 'custom') return;
      const [a, b] = value.split(':').map(Number);
      if (a > 0 && b > 0) {
        els.scaleA.value = a;
        els.scaleB.value = b;
        calculate();
      }
    }

    function invertScale() {
      const a = els.scaleA.value;
      els.scaleA.value = els.scaleB.value;
      els.scaleB.value = a;
      calculate();
    }

    function swapUnits() {
      const realUnit = els.realUnit.value;
      els.realUnit.value = els.drawingUnit.value;
      els.drawingUnit.value = realUnit;
      calculate();
    }

    function clearValues() {
  els.realValue.value = '';
  els.drawingValue.value = '';
  source = 'real';
  clearCalculatedDisplay();
  toast('Поля очищено');
}

    function resultText() { return resultSentence(); }

    async function copyText(text, success) {
      try { await navigator.clipboard.writeText(text); }
      catch {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      toast(success);
    }

    function toast(message) {
      els.toast.textContent = message;
      els.toast.classList.add('show');
      clearTimeout(toast._t);
      toast._t = setTimeout(() => els.toast.classList.remove('show'), 1700);
    }

    function params() {
      return new URLSearchParams({
        a: els.scaleA.value,
        b: els.scaleB.value,
        rv: els.realValue.value,
        ru: els.realUnit.value,
        dv: els.drawingValue.value,
        du: els.drawingUnit.value,
        src: source,
        dir: resultDirection
      });
    }

    function writeUrl(push = false) {
      const url = `${location.pathname}?${params().toString()}`;
      try {
        if (push) history.pushState(null, '', url);
        else history.replaceState(null, '', url);
      } catch { /* sandboxed preview may block history */ }
    }

    function readUrl() {
      const q = new URLSearchParams(location.search);
      const assign = (el, key) => { if (q.has(key)) el.value = q.get(key); };
      assign(els.scaleA, 'a');
      assign(els.scaleB, 'b');
      assign(els.realValue, 'rv');
      assign(els.realUnit, 'ru');
      assign(els.drawingValue, 'dv');
      assign(els.drawingUnit, 'du');
      if (q.has('src')) source = q.get('src') === 'drawing' ? 'drawing' : 'real';
      if (q.has('dir')) resultDirection = q.get('dir') === 'real-first' ? 'real-first' : 'drawing-first';
    }

    function setTheme(theme) {
      document.documentElement.dataset.theme = theme;
    }

    function initTheme() {
      const query = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      setTheme(query && query.matches ? 'dark' : 'light');
      query?.addEventListener?.('change', (event) => {
        if (!manualTheme) setTheme(event.matches ? 'dark' : 'light');
      });
    }

    function parseVoiceText(text, target) {
      const normalized = text.toLowerCase().replace(/,/g, '.');
      const number = normalized.match(/\d+(?:\.\d+)?/);
      if (!number) {
        toast('Не знайдено число');
        return;
      }
      const foundUnit = units.find(u => u.aliases.some(alias => normalized.includes(alias)));
      if (target === 'real') {
        els.realValue.value = number[0];
        if (foundUnit) els.realUnit.value = foundUnit.id;
        source = 'real';
      } else {
        els.drawingValue.value = number[0];
        if (foundUnit) els.drawingUnit.value = foundUnit.id;
        source = 'drawing';
      }
      calculate();
      toast(`Розпізнано: ${text}`);
    }

    function startVoice(target, button) {
      if (!SpeechRecognition) {
        toast('Голосове введення не підтримується браузером');
        return;
      }
      if (listeningButton) listeningButton.classList.remove('listening');
      listeningButton = button;
      button.classList.add('listening');
      const recognition = new SpeechRecognition();
      recognition.lang = 'uk-UA';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => parseVoiceText(event.results[0][0].transcript, target);
      recognition.onerror = () => toast('Не вдалося розпізнати голос');
      recognition.onend = () => {
        button.classList.remove('listening');
        if (listeningButton === button) listeningButton = null;
      };
      recognition.start();
    }

    function stepInput(targetId, direction) {
      const input = $(targetId);
      if (!input) return;
      const current = parseNumber(input.value);
      const base = Number.isFinite(current) ? current : 0;
      const rawStep = parseNumber(input.step);
      const delta = Number.isFinite(rawStep) && rawStep > 0 ? rawStep : 1;
      let next = base + (direction === 'up' ? delta : -delta);

if (targetId === 'scaleA' || targetId === 'scaleB') {
  if (next <= 0) next = 1;
} else {
  if (next < 0) next = 0;
}

input.value = inputFormat(next);
      if (targetId === 'drawingValue') source = 'drawing';
      if (targetId === 'realValue') source = 'real';
      calculate();
    }

    function stopStepRepeat() {
      clearTimeout(stepRepeatTimer);
      clearInterval(stepRepeatInterval);
      stepRepeatTimer = null;
      stepRepeatInterval = null;
    }

    function startStepRepeat(button) {
      stopStepRepeat();
      const target = button.dataset.stepTarget;
      const direction = button.dataset.stepDir;
      stepInput(target, direction);
      stepRepeatTimer = setTimeout(() => {
        stepRepeatInterval = setInterval(() => stepInput(target, direction), 80);
      }, 360);
    }

function setupAnimatedDetails(detailsId) {
  const details = document.getElementById(detailsId);
  if (!details) return;

  const summary = details.querySelector('summary');
  const body = details.querySelector('.details-body-wrap');

  if (!summary || !body) return;
if (details.open) {
  details.classList.add('is-open');
} else {
  details.classList.remove('is-open');
}
  let timer = null;

  function openDetails() {
  clearTimeout(timer);

  details.open = true;
  details.classList.add('is-open');

  body.style.maxHeight = '0px';
  body.style.opacity = '0';
  body.style.transform = 'translateY(-4px)';

  requestAnimationFrame(() => {
    body.style.maxHeight = `${body.scrollHeight}px`;
    body.style.opacity = '1';
    body.style.transform = 'translateY(0)';
  });

  timer = setTimeout(() => {
    body.style.maxHeight = 'none';
  }, 260);
}

  function closeDetails() {
  clearTimeout(timer);

  details.classList.remove('is-open');

  body.style.maxHeight = `${body.scrollHeight}px`;
  body.style.opacity = '1';
  body.style.transform = 'translateY(0)';

  requestAnimationFrame(() => {
    body.style.maxHeight = '0px';
    body.style.opacity = '0';
    body.style.transform = 'translateY(-4px)';
  });

  timer = setTimeout(() => {
    details.open = false;
    body.style.maxHeight = '';
    body.style.opacity = '';
    body.style.transform = '';
  }, 260);
}

  summary.addEventListener('click', (event) => {
    event.preventDefault();

    if (details.open) {
      closeDetails();
    } else {
      openDetails();
    }
  });
}
    function bind() {
      [
  els.scaleA,
  els.scaleB,
  els.realValue,
  els.drawingValue
].forEach(blockInvalidNumberChars);
      els.preset.addEventListener('change', () => setPreset(els.preset.value));
      els.scaleA.addEventListener('input', () => {
  clampNonNegativeInput(els.scaleA, 1);
  calculate();
});

els.scaleB.addEventListener('input', () => {
  clampNonNegativeInput(els.scaleB, 1);
  calculate();
});

els.realValue.addEventListener('input', () => {
  clampNonNegativeInput(els.realValue, 0);
  source = 'real';
  calculate();
});

els.drawingValue.addEventListener('input', () => {
  clampNonNegativeInput(els.drawingValue, 0);
  source = 'drawing';
  calculate();
});
      els.drawingValue.addEventListener('input', () => { source = 'drawing'; calculate(); });
      els.realUnit.addEventListener('change', calculate);
      els.drawingUnit.addEventListener('change', calculate);
      els.clearBtn.addEventListener('click', clearValues);
      els.copyLinkBtn.addEventListener('click', () => { writeUrl(true); copyText(location.href, 'URL скопійовано'); });
      els.copyResultBtn.addEventListener('click', () => copyText(resultText(), 'Скопійовано'));
      els.swapUnitsBtn.addEventListener('click', swapUnits);
      els.resultFlipBtn.addEventListener('click', () => {
        resultDirection = resultDirection === 'drawing-first' ? 'real-first' : 'drawing-first';
        calculate();
      });
      els.themeBtn.addEventListener('click', () => {
        manualTheme = true;
        setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
      });

      document.querySelectorAll('.step-btn').forEach(button => {
        button.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          button.setPointerCapture?.(event.pointerId);
          startStepRepeat(button);
        });
        button.addEventListener('pointerup', stopStepRepeat);
        button.addEventListener('pointercancel', stopStepRepeat);
        button.addEventListener('lostpointercapture', stopStepRepeat);
        button.addEventListener('mouseleave', stopStepRepeat);
      });

      document.querySelectorAll('.voice-btn').forEach(button => {
        if (!SpeechRecognition) {
          button.disabled = true;
          button.title = 'Голосове введення не підтримується цим браузером або режимом запуску';
        }
        button.addEventListener('click', () => startVoice(button.dataset.target, button));
      });
    }

    populateUnits();
    initTheme();
    readUrl();
    bind();
    setupAnimatedDetails('formulaDetails');
    calculate();
