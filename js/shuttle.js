// Shuttle page: typed headline, demos, live editor with JSON, outline tracking.
import { runDemo, wireCopy } from './demo.js';
import { mountOnDemand } from './editor-loader.js';

wireCopy();
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

// Hero: "# " vanishes, then the headline types itself once.
{
  const mark = document.getElementById('hero-mark');
  const text = document.getElementById('hero-text');
  const full = document.querySelector('.fit').textContent;
  if (reduced) {
    text.textContent = full;
  } else {
    (async () => {
      await sleep(350);
      mark.textContent = '#';
      await sleep(240);
      mark.textContent = '# ';
      await sleep(320);
      mark.textContent = '';
      for (const char of full) {
        text.textContent += char;
        await sleep(30 + Math.random() * 28);
      }
    })();
  }
}

// Demo: markdown turning into formatting, line by line.
{
  const frame = document.querySelector('[data-demo="markdown"]');
  const doc = frame.querySelector('[data-md]');
  const LINES = [
    { prefix: '## ', cls: 'md-h', text: 'Launch notes' },
    { inline: ['**Decide**', 'strong', 'Decide'], text: ' the date this week' },
    { prefix: '- ', cls: 'md-li', text: 'Book the room' },
    { prefix: '> ', cls: 'md-q', text: 'Ship it on a Tuesday.' },
    { inline: ['`npm publish`', 'code', 'npm publish'], text: ' after lunch' },
  ];
  runDemo(frame, async ({ wait, type }) => {
    doc.replaceChildren();
    await wait(500);
    for (const line of LINES) {
      const row = document.createElement('p');
      row.className = 'now';
      doc.append(row);
      const ghost = document.createElement('span');
      ghost.className = 'ghost';
      row.append(ghost);
      if (line.prefix) {
        await type(ghost, line.prefix, 120);
        await wait(240);
        ghost.remove();
        row.classList.add(line.cls);
      } else {
        await type(ghost, line.inline[0], 70);
        await wait(240);
        const done = document.createElement(line.inline[1]);
        done.textContent = line.inline[2];
        ghost.replaceWith(done);
      }
      const rest = document.createTextNode('');
      row.append(rest);
      for (const char of line.text) {
        rest.data += char;
        await wait(34 + Math.random() * 26);
      }
      await wait(300);
      row.classList.remove('now');
    }
    await wait(3000);
  });
}

// Demo: a block moves and keeps its id.
{
  const frame = document.querySelector('[data-demo="blocks"]');
  const list = frame.querySelector('[data-list]');
  const original = [...list.children];
  const moverStart = original[2];
  runDemo(frame, async ({ wait }) => {
    original.forEach((block) => {
      list.append(block);
      block.className = 'bk';
      block.style.transform = '';
      block.style.transition = '';
    });
    list.querySelector('.bk-line')?.remove();
    await wait(1000);
    moverStart.classList.add('is-hover');
    await wait(800);
    moverStart.classList.remove('is-hover');
    moverStart.classList.add('is-lifted');

    const line = document.createElement('div');
    line.className = 'bk-line';
    line.style.top = `${moverStart.offsetTop - 3}px`;
    list.append(line);
    const first = list.children[0];
    const distance = first.offsetTop - moverStart.offsetTop;
    moverStart.style.transition = 'transform 0.7s cubic-bezier(.45, 0, .2, 1)';
    await wait(60);
    moverStart.style.transform = `translateY(${distance}px)`;
    line.style.top = `${first.offsetTop - 3}px`;
    await wait(780);

    // Drop: move it in the DOM, and slide the others down from where they were.
    const others = original.filter((block) => block !== moverStart);
    const before = others.map((block) => block.offsetTop);
    moverStart.style.transition = '';
    moverStart.style.transform = '';
    list.prepend(moverStart);
    line.remove();
    others.forEach((block, index) => {
      block.style.transition = '';
      block.style.transform = `translateY(${before[index] - block.offsetTop}px)`;
    });
    void list.offsetHeight;
    others.forEach((block) => {
      block.style.transition = 'transform 0.35s cubic-bezier(.22, 1, .36, 1)';
      block.style.transform = '';
    });
    moverStart.classList.remove('is-lifted');
    moverStart.classList.add('is-landed');
    await wait(3400);
  });
}

// Live editor beside its JSON.
{
  const slot = document.getElementById('try-editor');
  const json = document.querySelector('#try-json code');
  const split = document.getElementById('try-split');
  const modes = document.querySelectorAll('[data-mode]');
  const palettes = document.querySelectorAll('[data-palette]');
  let editor = null;

  const press = (group, active) => group.forEach((button) => button.setAttribute('aria-pressed', String(button === active)));

  mountOnDemand(slot, {
    base: '../assets/editor/',
    seed: 'shuttle',
    mode: 'notepad',
    onJson: (doc) => { json.textContent = JSON.stringify(doc, null, 2); },
    onReady: (handle) => { editor = handle; },
  });
  modes.forEach((button) => button.addEventListener('click', () => {
    press(modes, button);
    editor?.setMode(button.dataset.mode);
  }));
  palettes.forEach((button) => button.addEventListener('click', () => {
    press(palettes, button);
    slot.classList.toggle('is-tokyo', button.dataset.palette === 'tokyo');
  }));
  void split;
}

// Outline follows the section on screen.
{
  const links = new Map([...document.querySelectorAll('.outline a')].map((a) => [a.getAttribute('href').slice(1), a]));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        links.forEach((a, id) => a.classList.toggle('is-on', id === entry.target.id));
      }
    }
  }, { rootMargin: '-30% 0px -60% 0px' });
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

// Newest version from npm. The page already shows a recent one if this fails.
fetch('https://registry.npmjs.org/shuttle-editor/latest')
  .then((response) => (response.ok ? response.json() : null))
  .then((data) => {
    if (!data?.version) return;
    document.querySelectorAll('[data-npm-version]').forEach((el) => { el.textContent = `v${data.version}`; });
  })
  .catch(() => {});
