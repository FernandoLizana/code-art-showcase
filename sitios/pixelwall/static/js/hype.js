/**
 * Efectos FOMO y provocación en la landing.
 */
const HypePage = (() => {
  const ROASTS = [
    '¿Sigues sin píxeles? En serio?',
    'Tu competencia ya está aquí. Tú no.',
    'Cada segundo sin logo = regalo a la competencia.',
    'Invisible no es una estrategia. Es cobardía.',
    'El muro no te extraña. Ni te necesita.',
    'Compra o sigue siendo nadie online.',
  ];

  function init() {
    rotateRoasts();
    initStickyCta();
    markVisitor();
  }

  function rotateRoasts() {
    const el = document.getElementById('hero-roast');
    if (!el) return;
    let i = 0;
    setInterval(() => {
      i = (i + 1) % ROASTS.length;
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = ROASTS[i];
        el.style.opacity = '1';
      }, 300);
    }, 4000);
    el.style.transition = 'opacity 0.3s';
  }

  function initStickyCta() {
    const bar = document.getElementById('sticky-cta');
    const shame = document.getElementById('shame-section');
    if (!bar || !shame) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          bar.classList.add('visible');
        } else {
          bar.classList.remove('visible');
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(shame);
  }

  function markVisitor() {
    const key = 'pixelwall_has_pixels';
    if (localStorage.getItem(key) === '1') {
      const shameYou = document.getElementById('shame-you');
      if (shameYou) {
        shameYou.innerHTML = '<p class="shame-you-text">Ya tienes píxeles aquí. <strong>No los dejes morir.</strong></p>';
      }
      const sticky = document.getElementById('sticky-cta');
      if (sticky) sticky.hidden = true;
    }
  }

  return { init, markHasPixels: () => localStorage.setItem('pixelwall_has_pixels', '1') };
})();
