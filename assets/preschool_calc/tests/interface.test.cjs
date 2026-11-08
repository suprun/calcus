const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../../..');
const html = fs.readFileSync(path.join(root, 'preschool_calc.html'), 'utf8');
const decode = text => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// A small DOM test double exercises handlers and markup contracts without starting a browser.
function start() {
  const elements = new Map();
  const windowHandlers = {};
  let copied = '';
  class Element {
    constructor(tag, attrs) {
      this.tagName = tag.toUpperCase();
      this.id = attrs.id;
      this.type = attrs.type || '';
      this.value = attrs.value || '';
      this.checked = Object.hasOwn(attrs, 'checked');
      this.hidden = Object.hasOwn(attrs, 'hidden');
      this.dataset = {};
      Object.entries(attrs).filter(([key]) => key.startsWith('data-')).forEach(([key, value]) => { this.dataset[key.slice(5)] = value; });
      this.listeners = {};
      this.children = [];
      this.selectionStart = 0;
      this.selectionEnd = 0;
      this.textContent = '';
    }
    set innerHTML(value) {
      this.children.forEach(id => elements.delete(id));
      this.markup = value;
      this.children = parse(value);
    }
    get innerHTML() { return this.markup || ''; }
    addEventListener(type, callback) { this.listeners[type] = callback; }
    focus() { document.activeElement = this; }
    setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
    select() { this.setSelectionRange(0, this.value.length); }
    closest(tag) { return this.tagName.toLowerCase() === tag ? this : null; }
  }
  function parse(markup) {
    const ids = [];
    const matches = markup.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi);
    for (const match of matches) {
      const attrs = {};
      for (const attr of match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[attr[1]] = decode(attr[2] || '');
      if (!attrs.id) continue;
      const element = new Element(match[1], attrs);
      if (match[1] === 'select') {
        const contents = markup.slice(match.index + match[0].length).split('</select>')[0];
        const selected = contents.match(/<option value="([^"]*)" selected/);
        element.value = selected ? selected[1] : contents.match(/<option value="([^"]*)"/)?.[1] || '';
      }
      elements.set(attrs.id, element);
      ids.push(attrs.id);
    }
    return ids;
  }
  parse(html);
  const document = {
    activeElement: null,
    getElementById: id => elements.get(id) || null,
    createElement: () => ({ click() {} }),
  };
  const context = vm.createContext({ document, window: { addEventListener: (type, cb) => { windowHandlers[type] = cb; }, print: () => windowHandlers.beforeprint() },
    navigator: { clipboard: { writeText: async text => { copied = text; } } }, Intl, Blob,
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} }, setTimeout: callback => callback() });
  ['norms.js', 'calculations.js', 'script.js'].forEach(file => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file }));
  const get = id => {
    const element = elements.get(id);
    assert.ok(element, `Missing element ${id}`);
    return element;
  };
  const input = (id, value) => {
    const element = get(id);
    if (element.type === 'checkbox') element.checked = value;
    else element.value = value;
    element.focus();
    get('calculator').listeners[element.type === 'checkbox' || element.tagName === 'SELECT' ? 'change' : 'input']({ type: element.type === 'checkbox' || element.tagName === 'SELECT' ? 'change' : 'input', target: element });
  };
  const click = id => {
    const button = get(id);
    if (button.listeners.click) return button.listeners.click({ target: button });
    return get('calculator').listeners.click({ target: button });
  };
  const auto = key => get('calculator').listeners.click({ target: { closest: () => ({ dataset: { auto: key } }) } });
  return { get, input, click, auto, copied: () => copied, elements };
}

test('page initializes all sections, output containers, labels and unique static ids', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  const app = start();
  assert.ok(app.get('siteAreas').innerHTML.includes('3\u00a0600') || app.get('siteAreas').innerHTML.includes('3\u202f600'));
  assert.ok(app.get('liveStatus').textContent.includes('Оновлено'));
  for (const element of app.elements.values()) {
    for (const match of element.innerHTML.matchAll(/\bfor="([^"]+)"/g)) assert.ok(app.elements.has(match[1]), `Unbound label ${match[1]}`);
  }
});

test('capacity, accepted site hectares and automatic reset update one form without losing partial decimals', () => {
  const app = start();
  app.input('input-capacity', '30');
  assert.ok(app.get('playAreas').innerHTML.includes('small-shared'));
  app.input('input-siteUnit', 'ha');
  app.input('area-site', '0,');
  assert.equal(app.get('area-site').value, '0,');
  app.input('area-site', '0,3');
  assert.equal(app.get('area-site').value, '0,3');
  app.input('input-siteUnit', 'sqm');
  assert.equal(app.get('area-site').value, '3000');
  app.input('input-capacity', '40');
  assert.equal(app.get('area-site').value, '3000');
  app.auto('site');
  assert.equal(app.get('area-site').value, '2000');
});

test('group editing drives detail rows; invalid group clears dependent balance', () => {
  const app = start();
  app.input('input-capacity', '41');
  app.click('addGroup');
  app.input('count-1', '41');
  app.input('input-footprint', '200');
  assert.ok(app.get('playAreas').innerHTML.includes('group-1'));
  assert.ok(app.get('balanceResults').innerHTML.includes('Зайнято'));
  app.input('count-1', 'oops');
  assert.ok(app.get('balanceResults').innerHTML.includes('Баланс неповний'));
  assert.ok(app.get('siteAreas').innerHTML.includes('1845') || app.get('siteAreas').innerHTML.includes('1\u00a0845'));
});

test('copy and print use latest inputs and include errors and sources', async () => {
  const app = start();
  app.input('input-name', '<script>test</script>');
  app.input('input-capacity', '24');
  await app.click('copyReport');
  assert.ok(app.copied().includes('<script>test</script>'));
  assert.ok(app.copied().includes('DBN6.pdf'));
  app.input('input-capacity', '0');
  await app.click('copyReport');
  assert.ok(app.copied().includes('Місткість: допустимо'));
  app.click('printReport');
  assert.ok(app.get('printTable').innerHTML.includes('&lt;script&gt;test&lt;/script&gt;'));
  assert.ok(app.get('printTable').innerHTML.includes('Місткість: допустимо'));
});

test('local resources resolve and page does not embed SVG geometry or executable inline code', () => {
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|#)/.test(target)) continue;
    assert.ok(fs.existsSync(path.resolve(root, target)), target);
  }
  assert.doesNotMatch(html, /<svg|data:image\/svg|<script(?![^>]*\bsrc=)[^>]*>\s*\S/i);
  assert.match(html, /<head>\s*<script async src="assets\/shared\/analytics.js"/);
});
