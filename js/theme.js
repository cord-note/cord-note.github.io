// Light and dark toggle. The inline script in <head> applies the saved choice before paint.
const root = document.documentElement;
const key = root.dataset.themeKey;

function set(next) {
  root.dataset.theme = next;
  try {
    localStorage.setItem(key, next);
  } catch {
    // Not saved; the choice lasts for this page view.
  }
  document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
}

export function toggleTheme() {
  set(root.dataset.theme === 'dark' ? 'light' : 'dark');
}

const button = document.getElementById('theme-toggle');
if (button) {
  button.hidden = false;
  button.addEventListener('click', toggleTheme);
}
