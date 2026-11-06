// Cord page: hero scene, window rise, demos, palette, theme wall, live editor.
import { startScene } from './scene.js';
import { runDemo, wireCopy } from './demo.js';
import { toggleTheme } from './theme.js';
import { mountOnDemand } from './editor-loader.js';

const THEMES = ['blush', 'catppuccin', 'dracula', 'ember', 'espresso', 'everforest', 'evergreen', 'gruvbox', 'harbour', 'hazard', 'ink', 'kanagawa', 'koi', 'kombu', 'lavender', 'lotus', 'maroon-oak', 'meadow', 'neon-red', 'nord', 'orchid', 'rose-pine', 'solarized', 'spiced-cocoa', 'steel', 'sunset-drive', 'terracotta', 'tidepool', 'tokyo-night', 'trailhead', 'ultraviolet', 'winter-woods'];

const titleCase = (id) => id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

startScene(document.getElementById('scene'));
wireCopy();
mountOnDemand(document.getElementById('try-editor'), { base: 'assets/editor/' });

// Theme wall, from each theme's own preview.svg.
const wall = document.getElementById('theme-wall');
wall.innerHTML = THEMES.map((id) => `<li><a href="https://github.com/cord-note/cord-themes/tree/main/themes/${id}"><img src="assets/themes/${id}.svg" alt="" width="640" height="262" loading="lazy"><span>${titleCase(id)}</span></a></li>`).join('');

// The window settles into place as the page scrolls.
const rise = document.getElementById('rise');
if (rise && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let ticking = false;
  const update = () => {
    ticking = false;
    const box = rise.parentElement.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, 1 - (box.top - 80) / (window.innerHeight * 0.7)));
    const eased = 1 - (1 - progress) ** 3;
    rise.style.transform = `scale(${0.93 + 0.07 * eased})`;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

// Demo: wiki link and backlink.
{
  const frame = document.querySelector('[data-demo="links"]');
  const typed = frame.querySelector('[data-typed]');
  const link = frame.querySelector('[data-link]');
  const caret = frame.querySelector('[data-caret]');
  const suggest = frame.querySelector('[data-suggest]');
  const items = suggest.querySelectorAll('li');
  const count = frame.querySelector('[data-count]');
  const back = frame.querySelector('[data-back]');
  const LINK = link.textContent;
  runDemo(frame, async ({ wait, type }) => {
    typed.textContent = '';
    link.textContent = '';
    link.className = 'wikilink ghost';
    count.textContent = '0 backlinks';
    back.hidden = true;
    back.style.display = 'none';
    suggest.hidden = true;
    await wait(500);
    await type(typed, 'Diekelmann and Born cover this in ', 34);
    await wait(350);
    await type(link, '[[', 130);
    suggest.hidden = false;
    items[0].className = 'on'; items[1].className = '';
    await wait(450);
    await type(link, 'Read', 110);
    await wait(500);
    items[0].className = ''; items[1].className = 'on';
    await wait(380);
    items[0].className = 'on'; items[1].className = '';
    await wait(450);
    suggest.hidden = true;
    link.textContent = LINK;
    link.className = 'wikilink';
    await wait(420);
    count.textContent = '1 backlink';
    back.style.display = '';
    back.hidden = false;
    back.classList.remove('is-new');
    void back.offsetWidth;
    back.classList.add('is-new');
    caret.hidden = false;
    await wait(3200);
  });
}

// Demo: tag a single block.
{
  const frame = document.querySelector('[data-demo="blocks"]');
  const target = frame.querySelector('[data-target]');
  const menu = frame.querySelector('[data-menu]');
  const item = frame.querySelector('[data-tagitem]');
  const chip = frame.querySelector('[data-chip]');
  runDemo(frame, async ({ wait }) => {
    chip.hidden = true;
    menu.hidden = true;
    target.classList.remove('is-hover');
    item.className = '';
    await wait(900);
    target.classList.add('is-hover');
    await wait(800);
    menu.hidden = false;
    await wait(650);
    item.className = 'on';
    await wait(600);
    menu.hidden = true;
    chip.hidden = false;
    chip.classList.remove('is-new');
    void chip.offsetWidth;
    chip.classList.add('is-new');
    await wait(600);
    target.classList.remove('is-hover');
    await wait(3000);
  });
}

// Demo: edit once, the quote follows.
{
  const frame = document.querySelector('[data-demo="quote"]');
  const source = frame.querySelector('[data-source]');
  const mirror = frame.querySelector('[data-mirror]');
  const caret = frame.querySelector('[data-caret]');
  const A = 'Papers that conflate the two produce arguments that cannot be settled.';
  const B = 'Papers that conflate the two produce arguments nobody can settle.';
  const keep = 'Papers that conflate the two produce arguments ';
  const set = (text) => { source.textContent = text; mirror.textContent = text; };
  runDemo(frame, async ({ wait }) => {
    set(A);
    caret.hidden = false;
    await wait(1400);
    for (let n = A.length; n >= keep.length; n -= 1) {
      set(A.slice(0, n));
      await wait(26);
    }
    await wait(250);
    for (let n = keep.length; n <= B.length; n += 1) {
      set(B.slice(0, n));
      await wait(62);
    }
    caret.hidden = true;
    await wait(2800);
  });
}

// Demo: the note list narrowing per keystroke, matching inside words.
{
  const frame = document.querySelector('[data-demo="search"]');
  const query = frame.querySelector('[data-query]');
  const list = frame.querySelector('[data-list]');
  const results = frame.querySelector('[data-results]');
  const NOTES = [
    'Lecture 1: What Consolidation Means',
    'Lecture 4: Hippocampal Replay',
    'Seminar: The Reconsolidation Debate',
    'Stats: Signal Detection Theory',
    'Essay Plan: Does Sleep Cause Consolidation?',
  ];
  const show = (text) => {
    query.textContent = text;
    const found = NOTES.filter((title) => title.toLowerCase().includes(text));
    list.replaceChildren(...found.map((title) => {
      const row = document.createElement('li');
      row.textContent = title;
      return row;
    }));
    results.textContent = text ? `${found.length} ${found.length === 1 ? 'note' : 'notes'}` : '12 notes';
  };
  runDemo(frame, async ({ wait }) => {
    show('');
    await wait(1100);
    for (const text of ['c', 'co', 'con', 'cons', 'conso', 'consol']) {
      show(text);
      await wait(170 + Math.random() * 90);
    }
    await wait(3400);
  });
}

// Palette: same shape as the app's, jumps around the page.
const COMMANDS = [
  ['Jump to', 'Download', () => go('#download')],
  ['Jump to', 'Links and backlinks', () => go('#links')],
  ['Jump to', 'Block tags', () => go('#blocks')],
  ['Jump to', 'Quotes', () => go('#quote')],
  ['Jump to', 'Search', () => go('#search')],
  ['Jump to', 'Keyboard', () => go('#keyboard')],
  ['Jump to', 'Try the editor', () => go('#try')],
  ['Jump to', 'Themes', () => go('#themes')],
  ['Jump to', 'The details', () => go('#details')],
  ['Settings', 'Switch light and dark', () => toggleTheme()],
  ['Elsewhere', 'Shuttle, the editor', () => { location.href = 'shuttle/'; }],
  ['Elsewhere', 'Source on GitHub', () => { location.href = 'https://github.com/cord-note/cord'; }],
  ['Elsewhere', 'Changelog', () => { location.href = 'https://github.com/cord-note/cord/blob/main/CHANGELOG.md'; }],
];

function go(hash) {
  document.querySelector(hash).scrollIntoView();
  history.replaceState(null, '', hash);
}

const palette = document.getElementById('palette');
const input = document.getElementById('palette-input');
const list = document.getElementById('palette-list');
const opener = document.getElementById('palette-open');
let shown = [];
let selected = 0;

function render() {
  const query = input.value.trim().toLowerCase();
  shown = COMMANDS.filter(([, label]) => label.toLowerCase().includes(query));
  selected = Math.min(selected, Math.max(0, shown.length - 1));
  list.replaceChildren();
  if (!shown.length) {
    const empty = document.createElement('li');
    empty.className = 'palette-empty';
    empty.textContent = 'Nothing matches that.';
    list.append(empty);
    return;
  }
  let group = '';
  shown.forEach(([heading, label], index) => {
    if (heading !== group) {
      group = heading;
      const row = document.createElement('li');
      row.className = 'palette-group';
      row.setAttribute('role', 'presentation');
      row.textContent = heading;
      list.append(row);
    }
    const row = document.createElement('li');
    row.className = 'palette-item';
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', String(index === selected));
    row.textContent = label;
    row.addEventListener('click', () => choose(index));
    row.addEventListener('mousemove', () => {
      if (selected !== index) { selected = index; render(); }
    });
    list.append(row);
  });
  list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
}

function open() {
  palette.hidden = false;
  input.value = '';
  selected = 0;
  render();
  input.focus();
}

function close() {
  palette.hidden = true;
  opener.focus();
}

function choose(index) {
  const command = shown[index];
  if (!command) return;
  close();
  command[2]();
}

opener.hidden = false;
opener.addEventListener('click', open);
input.addEventListener('input', () => { selected = 0; render(); });
palette.addEventListener('click', (event) => { if (event.target === palette) close(); });
palette.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') close();
  else if (event.key === 'Enter') { event.preventDefault(); choose(selected); }
  else if (event.key === 'ArrowDown') { selected = (selected + 1) % shown.length; render(); event.preventDefault(); }
  else if (event.key === 'ArrowUp') { selected = (selected - 1 + shown.length) % shown.length; render(); event.preventDefault(); }
});
addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (palette.hidden) open(); else close();
  }
});
