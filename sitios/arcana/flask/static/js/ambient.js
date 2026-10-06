/** Ambiente sonoro + título mutante — ARCANA OBSCURA */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const TITLES = [
    document.title,
    "no mires",
    "sigue",
    "aún estás aquí",
    "algo escucha",
    "ARCANA OBSCURA",
    "no cierres",
    "recuerda el nombre",
  ];
  let ti = 0;
  setInterval(() => {
    ti = (ti + 1) % TITLES.length;
    document.title = TITLES[ti];
  }, 45000);

  let ctx = null;
  let started = false;

  function startAmbient() {
    if (started) return;
    started = true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.018;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 280;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();

      setInterval(() => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 55 + Math.random() * 30;
        g.gain.value = 0;
        g.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 2);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 8);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 8);
      }, 90000);
    } catch (_) {
      /* sin audio */
    }
  }

  document.addEventListener("click", startAmbient, { once: true });
  document.addEventListener("keydown", startAmbient, { once: true });

  window.arcanaPulse = function () {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.value = 110;
    g.gain.value = 0.025;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  };

  setInterval(function () {
    if (Math.random() < 0.07) {
      document.body.classList.add("flicker");
      setTimeout(function () { document.body.classList.remove("flicker"); }, 150);
    }
  }, 120000);
})();
