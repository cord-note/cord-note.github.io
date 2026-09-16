/* Accent-theme picker. Sets data-theme on <html>, which is the same mechanism
   the Cord app uses, so the tokens in tokens.css do all the work.
   Light and dark follow the system; this picker does not change that. */

const THEMES = [
  { id: 'mono',      label: 'Mono' },
  { id: 'blue',      label: 'Blue' },
  { id: 'olive',     label: 'Olive' },
  { id: 'teal',      label: 'Teal' },
  { id: 'midnight',  label: 'Midnight' },
  { id: 'rosewood',  label: 'Rosewood' },
  { id: 'parchment', label: 'Parchment' },
];

const STORAGE_KEY = 'cord-site-theme';

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return THEMES.some((t) => t.id === value) ? value : 'mono';
  } catch {
    return 'mono';
  }
}

function store(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* Private windows and blocked site data both throw here. The theme still
       applies for this page view; it just is not remembered. */
  }
}

function apply(id) {
  /* Mono is the :root default, so it is expressed as the absence of the
     attribute rather than as data-theme="mono". */
  if (id === 'mono') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', id);
  }
  for (const button of document.querySelectorAll('#theme-buttons button')) {
    button.setAttribute('aria-pressed', String(button.dataset.theme === id));
  }
}

function init() {
  const host = document.getElementById('theme-buttons');
  const picker = document.querySelector('.theme-picker');
  if (!host || !picker) return;

  for (const theme of THEMES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.theme = theme.id;
    button.title = theme.label;
    button.setAttribute('aria-label', theme.label);
    button.addEventListener('click', () => {
      apply(theme.id);
      store(theme.id);
    });
    host.appendChild(button);
  }

  picker.hidden = false;
  apply(readStored());
}

init();
