// Loads the live editor bundle when its slot nears the screen, or on click.
const root = document.documentElement;

export function mountOnDemand(slot, { base, seed = 'cord', mode = 'note', onJson, onReady } = {}) {
  let started = false;
  const scheme = () => (root.dataset.theme === 'light' && !slot.classList.contains('is-tokyo') ? 'light' : 'dark');
  const button = slot.querySelector('[data-editor-load]');

  async function start() {
    if (started) return;
    started = true;
    if (button) { button.textContent = 'Loading the editor...'; button.disabled = true; }
    try {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = new URL(`${base}editor.css`, document.baseURI).href;
      document.head.append(css);
      const module = await import(new URL(`${base}editor.js`, document.baseURI).href);
      slot.replaceChildren();
      slot.classList.add('is-live');
      const handle = module.mount(slot, { seed, mode, scheme: scheme(), onJson });
      new MutationObserver(() => handle.setScheme(scheme())).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
      new MutationObserver(() => handle.setScheme(scheme())).observe(slot, { attributes: true, attributeFilter: ['class'] });
      onReady?.(handle);
    } catch {
      started = false;
      if (button) { button.textContent = 'Could not load. Try again'; button.disabled = false; }
    }
  }

  button?.addEventListener('click', start);
  new IntersectionObserver(([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    start();
  }, { rootMargin: '500px' }).observe(slot);
}
