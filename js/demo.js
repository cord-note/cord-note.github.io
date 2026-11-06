// Runs scripted demos: loops while on screen, stops off screen, respects reduced motion.
const Stop = Symbol('stop');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const PAUSE_ICON = '<svg class="i-pause" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1" width="3" height="10" rx="1"/><rect x="7" y="1" width="3" height="10" rx="1"/></svg><svg class="i-play" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9a.5.5 0 0 0 .77.42l7-4.5a.5.5 0 0 0 0-.84l-7-4.5A.5.5 0 0 0 3 1.5Z"/></svg>';

// `script` receives { wait, type } and plays one round. The frame's HTML is the end state.
export function runDemo(frame, script) {
  if (reduced.matches) return;
  let run = 0;
  let onScreen = false;
  let paused = false;
  let resume = null;

  const button = document.createElement('button');
  button.className = 'demo-pause';
  button.type = 'button';
  button.setAttribute('aria-label', 'Pause animation');
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = PAUSE_ICON;
  button.addEventListener('click', () => {
    paused = !paused;
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
    if (!paused && resume) resume();
  });
  frame.append(button);

  async function play(id) {
    const wait = async (ms) => {
      let left = ms;
      while (left > 0) {
        if (id !== run) throw Stop;
        if (paused) await new Promise((done) => { resume = done; });
        const step = Math.min(left, 60);
        await new Promise((done) => setTimeout(done, step));
        left -= step;
      }
      if (id !== run) throw Stop;
    };
    const type = async (node, text, speed = 55) => {
      for (const char of text) {
        node.textContent += char;
        await wait(speed + Math.random() * 35);
      }
    };
    try {
      for (;;) await script({ wait, type });
    } catch (error) {
      if (error !== Stop) throw error;
    }
  }

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting === onScreen) return;
    onScreen = entry.isIntersecting;
    run += 1;
    if (onScreen) play(run);
  }, { threshold: 0.35 }).observe(frame);
}

// Copy buttons on `.cmd` blocks.
export function wireCopy() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    const icon = button.innerHTML;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 8.5 3 3 7-7"/></svg>';
        button.setAttribute('aria-label', 'Copied');
        setTimeout(() => {
          button.innerHTML = icon;
          button.setAttribute('aria-label', 'Copy command');
        }, 1600);
      } catch {
        button.setAttribute('aria-label', 'Copy failed. Select the text instead.');
      }
    });
  });
}
