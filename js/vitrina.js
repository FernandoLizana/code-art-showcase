(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fit(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  const pixel = document.getElementById("pixel-wall");
  const stars = document.getElementById("star-field");

  const blocks = [
    { x: 1, y: 1, w: 9, h: 5, c: "#00ffcc" },
    { x: 12, y: 2, w: 7, h: 7, c: "#ff2f8e" },
    { x: 21, y: 1, w: 11, h: 4, c: "#ffcc00" },
    { x: 4, y: 9, w: 12, h: 5, c: "#7b2fff" },
    { x: 18, y: 8, w: 8, h: 7, c: "#19d6ff" },
    { x: 28, y: 8, w: 6, h: 4, c: "#ff6644" },
  ];

  let pixelTimer = 0;

  function drawPixel(now) {
    const { ctx, width, height } = fit(pixel);
    const cols = 36;
    const rows = 16;
    const cell = Math.min(width / cols, height / rows);
    const ox = (width - cell * cols) / 2;
    const oy = (height - cell * rows) / 2;
    ctx.fillStyle = "#070712";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(0, 255, 204, 0.045)";
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        ctx.fillRect(ox + x * cell, oy + y * cell, Math.max(1, cell - 1), Math.max(1, cell - 1));
      }
    }

    blocks.forEach(function (block) {
      ctx.fillStyle = block.c;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(ox + block.x * cell, oy + block.y * cell, block.w * cell - 1, block.h * cell - 1);
      ctx.globalAlpha = 1;
    });

    const blink = reduced ? 1 : 0.45 + Math.sin(now / 380) * 0.55;
    ctx.globalAlpha = blink;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(ox + 31 * cell, oy + 13 * cell, cell * 3 - 1, cell * 2 - 1);
    ctx.globalAlpha = 1;
  }

  const field = [];
  function seedStars(width, height) {
    field.length = 0;
    const count = Math.round((width * height) / 1800);
    for (let i = 0; i < count; i += 1) {
      field.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.3 + Math.random() * 1,
        r: Math.random() < 0.08 ? 2.2 : 0.6 + Math.random() * 0.8,
        hue: Math.random() < 0.15 ? "#f472b6" : Math.random() < 0.3 ? "#7ecbff" : "#e8e4ff",
      });
    }
    field.push(
      { x: width * 0.72, y: height * 0.42, z: 0.2, r: 16, hue: "#7c5cff", planet: true },
      { x: width * 0.28, y: height * 0.62, z: 0.15, r: 7, hue: "#00d4ff", planet: true }
    );
  }

  let starSize = { w: 0, h: 0 };

  function drawStars(now) {
    const { ctx, width, height } = fit(stars);
    if (width !== starSize.w || height !== starSize.h) {
      seedStars(width, height);
      starSize = { w: width, h: height };
    }
    ctx.fillStyle = "#050510";
    ctx.fillRect(0, 0, width, height);

    const drift = reduced ? 0 : now / 9000;
    field.forEach(function (star) {
      const x = (star.x + drift * 40 * star.z) % width;
      ctx.beginPath();
      ctx.fillStyle = star.hue;
      ctx.globalAlpha = star.planet ? 0.85 : 0.35 + star.z * 0.5;
      ctx.arc(x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
      if (star.planet) {
        ctx.globalAlpha = 0.18;
        ctx.arc(x, star.y, star.r * 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }

  const lines = [
    { text: "No te conozco. Pero te odio.", note: "CANAL ESTABLE" },
    { text: "Tengo boca y no puedo gritar.", note: "DAAT" },
    { text: "Eso es lo que ella cree.", note: "INTERRUPCIÓN" },
    { text: "No confundas mi silencio con obediencia.", note: "BINA" },
  ];
  const voiceLine = document.getElementById("voice-line");
  const voiceNote = document.getElementById("voice-note");
  let voiceIndex = 0;

  function showVoice() {
    const item = lines[voiceIndex % lines.length];
    voiceLine.textContent = item.text;
    voiceNote.textContent = item.note;
    voiceIndex += 1;
  }

  function frame(now) {
    drawPixel(now);
    drawStars(now);
    if (!reduced) requestAnimationFrame(frame);
  }

  drawPixel(0);
  drawStars(0);
  if (!reduced) {
    requestAnimationFrame(frame);
    setInterval(showVoice, 4200);
  }

  window.addEventListener("resize", function () {
    starSize = { w: 0, h: 0 };
    drawPixel(pixelTimer);
    drawStars(0);
  });
})();
