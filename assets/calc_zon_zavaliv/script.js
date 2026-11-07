'use strict';
    // Rows correspond to the 9/12/14/16/20/25-floor upper limits in Appendix A.
    // For 1–9 floors, the blank long-side cell is explicitly assumed as 0.65.
    const ROWS = [
      { max:9,  flat:[.65,.55,.65], s10_15:[.6,.8], s16_20:[.6,.85], s21_30:[.6,.9], s31_35:[.55,1], s35plus:[.55,1] },
      { max:12, flat:[.75,.6,.75], s10_15:[.65,.9], s16_20:[.65,1], s21_30:[.6,1.1], s31_35:[.6,1.2], s35plus:[.6,1.2] },
      { max:14, flat:[.75,.6,.75], s10_15:[.65,.9], s16_20:[.65,1], s21_30:[.6,1.1], s31_35:[.6,1.2], s35plus:[.6,1.2] },
      { max:16, flat:[1,.65,1], s10_15:[.9,1.3], s16_20:[.65,1.6], s21_30:[.8,1.65], s31_35:[.75,2.1], s35plus:[.7,2.5] },
      { max:20, flat:[1,.65,1], s10_15:[.9,1.3], s16_20:[.75,1.6], s21_30:[.8,1.65], s31_35:[.75,2.1], s35plus:[.7,2.5] },
      { max:25, flat:[1,.65,1], s10_15:[.9,1.3], s16_20:[.85,1.6], s21_30:[.8,1.65], s31_35:[.75,2.1], s35plus:[.7,2.55] }
    ];
    const SLOPE_KEYS = { 's10-15':'s10_15', 's16-20':'s16_20', 's21-30':'s21_30', 's31-35':'s31_35', 's35plus':'s35plus' };
    const $ = id => document.getElementById(id);
    const selected = name => document.querySelector(`input[name="${name}"]:checked`).value;
    const fmt = (n, maxDigits=2) => new Intl.NumberFormat('uk-UA', { maximumFractionDigits:maxDigits }).format(n);
    function numericValue(raw) {
      const normalized = raw.trim().replace(/\s+/g,'').replace(',','.');
      if (!/^\d+(?:\.\d+)?$/.test(normalized)) return NaN;
      return Number(normalized);
    }
    function showError(message) {
      $('result-value').textContent = '—';
      $('result-value').classList.add('status-error');
      $('floor-range').textContent = '—';
      $('factor').textContent = '—';
      $('source').textContent = '—';
      $('formula').textContent = message;
      $('notice').hidden = true;
    }
    function calculate() {
      const mode = selected('mode');
      const slope = selected('slope');
      const isFlat = slope === 'flat';
      $('height-row').hidden = mode !== 'direct';
      $('width-row').hidden = mode !== 'inverse';
      $('side-fieldset').hidden = !isFlat;
      $('direction-fieldset').hidden = isFlat;
      $('result-label').textContent = mode === 'direct' ? 'Ширина зони можливих завалів' : 'Розрахункова висота будівлі';
      $('result-value').classList.remove('status-error');

      const floors = Number($('floors').value);
      if (!$('floors').value || !Number.isInteger(floors) || floors < 1) {
        showError('Укажіть поверховість цілим числом від 1.'); return;
      }
      if (floors > 25) {
        showError('Для будівель понад 25 поверхів додаток А передбачає окремий розрахунок. Табличний коефіцієнт не застосовується.');
        $('notice').hidden = false;
        $('notice').textContent = 'Понад 25 поверхів: визначається індивідуальним розрахунком.';
        return;
      }
      const raw = mode === 'direct' ? $('height').value : $('width').value;
      const value = numericValue(raw);
      if (!Number.isFinite(value) || value <= 0) {
        showError(mode === 'direct' ? 'Укажіть додатну висоту будівлі в метрах.' : 'Укажіть додатну ширину зони завалів у метрах.'); return;
      }
      const row = ROWS.find(r => floors <= r.max);
      const rowIndex = ROWS.indexOf(row);
      const lower = rowIndex === 0 ? 1 : ROWS[rowIndex - 1].max + 1;
      let coefficient;
      let assumed = false;
      if (isFlat) {
        const side = selected('side');
        const sideIndex = {long:0, end:1, tower:2}[side];
        coefficient = row.flat[sideIndex];
        assumed = floors <= 9 && side === 'long';
      } else {
        const index = selected('direction') === 'up' ? 0 : 1;
        coefficient = row[SLOPE_KEYS[slope]][index];
      }
      const answer = mode === 'direct' ? value * coefficient : value / coefficient;
      const x = fmt(value, 5), k = fmt(coefficient, 2), y = fmt(answer, 2);
      $('result-value').textContent = y + ' м';
      $('floor-range').textContent = `${lower}–${row.max} поверхів`;
      $('factor').textContent = k;
      $('source').textContent = assumed ? 'Прийняте значення' : 'Додаток А ДБН';
      $('formula').textContent = mode === 'direct' ? `L = ${k} × ${x} = ${y} м` : `H = ${x} ÷ ${k} = ${y} м`;
      $('notice').hidden = !assumed;
      if (assumed) $('notice').textContent = 'Для 1–9-поверхових будівель від довших сторін у таблиці додатка А значення не наведено. За прийнятим для цього калькулятора припущенням використано 0,65H.';
    }
    document.querySelectorAll('input').forEach(control => {
      control.addEventListener('input', calculate);
      control.addEventListener('change', calculate);
    });
    calculate();
