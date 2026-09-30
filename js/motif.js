/* Draws each margin motif in when it scrolls into view. The CSS only arms the
   animation under html.js, so without this file the motifs show complete. */

const motifs = document.querySelectorAll('.motif');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-drawn');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -15% 0px' },
  );
  motifs.forEach((m) => observer.observe(m));
} else {
  motifs.forEach((m) => m.classList.add('is-drawn'));
}
