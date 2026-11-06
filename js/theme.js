// Follows the device theme until the button overrides it. The inline script in <head> sets the first paint.
const KEY = 'cord-site-theme';
const root = document.documentElement;
const device = window.matchMedia('(prefers-color-scheme: dark)');
const deviceTheme = () => (device.matches ? 'dark' : 'light');

function saved() {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function save(value) {
  try {
    if (value) localStorage.setItem(KEY, value);
    else localStorage.removeItem(KEY);
  } catch {
    // Not saved; the choice lasts for this page view.
  }
}

// Choosing the device's own theme clears the override, so the page follows the device again.
export function toggleTheme() {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  save(next === deviceTheme() ? null : next);
}

device.addEventListener('change', () => {
  if (!saved()) root.dataset.theme = deviceTheme();
});

const button = document.getElementById('theme-toggle');
if (button) {
  button.hidden = false;
  button.addEventListener('click', toggleTheme);
}
