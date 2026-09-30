/* Paper / Charcoal toggle. The saved choice is applied before first paint by
   the inline script in each page's <head>; this file only wires the button.
   Storage can be unavailable (private windows, blocked site data), so every
   access is guarded and the page works without it. */

const KEY = 'cord-site-theme';
const NAMES = { light: 'Paper', dark: 'Charcoal' };
const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function current() {
  const explicit = root.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return systemDark.matches ? 'dark' : 'light';
}

function render(button) {
  const theme = current();
  const other = theme === 'dark' ? 'light' : 'dark';
  button.querySelector('.toggle-text').textContent = NAMES[theme];
  button.setAttribute('aria-label', `Theme: ${NAMES[theme]}. Switch to ${NAMES[other]}.`);
}

const button = document.getElementById('theme-toggle');
if (button) {
  button.hidden = false;
  render(button);

  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* Not saved; the choice lasts for this page view. */
    }
    render(button);
  });

  systemDark.addEventListener('change', () => render(button));
}
