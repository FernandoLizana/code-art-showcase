/** Interacciones de niveles — ARCANA OBSCURA (Flask) */
(function () {
  const form = document.getElementById("level-form");
  if (!form) return;

  const payloadInput = document.getElementById("payload-json");
  const uiType = form.dataset.uiType || "text";
  const levelId = parseInt(form.dataset.levelId || "0", 10);

  function submitPayload(payload) {
    payloadInput.value = JSON.stringify(payload);
    form.submit();
  }

  /* --- Nivel 1: marcas --- */
  document.querySelectorAll("[data-mark-index]").forEach((btn) => {
    let clicks = 0;
    btn.addEventListener("click", () => {
      clicks += 1;
      submitPayload({ markIndex: parseInt(btn.dataset.markIndex, 10), clickCount: clicks });
    });
  });

  /* --- Nivel 2: cartas --- */
  document.querySelectorAll("[data-card-id]").forEach((btn) => {
    btn.addEventListener("click", () => submitPayload({ cardId: btn.dataset.cardId }));
  });

  /* --- Nivel 3: habitación negra --- */
  const blackRoom = document.getElementById("black-room");
  if (blackRoom) {
    const zone = JSON.parse(blackRoom.dataset.zone || "{}");
    const hidden = document.getElementById("hidden-field");
    blackRoom.addEventListener("mousemove", (e) => {
      const rect = blackRoom.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const inside =
        x >= zone.x && x <= zone.x + zone.width && y >= zone.y && y <= zone.y + zone.height;
      if (hidden) hidden.style.opacity = inside ? "0.35" : "0.08";
    });
  }

  /* --- Nivel 4: ojo --- */
  const eye = document.getElementById("watching-eye");
  if (eye) {
    let gazeAwayMs = 0;
    let lastAway = 0;
    document.addEventListener("mousemove", (e) => {
      const rect = eye.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const away = dist > 120;
      eye.style.opacity = away ? "1" : "0.15";
      if (away) {
        if (lastAway) gazeAwayMs += Date.now() - lastAway;
        lastAway = Date.now();
      } else {
        lastAway = 0;
      }
    });
    eye.addEventListener("click", () => submitPayload({ gazeAwayMs, clicked: true }));
    document.getElementById("eye-submit")?.addEventListener("click", () =>
      submitPayload({ gazeAwayMs, clicked: false, symbol: document.getElementById("eye-answer")?.value }),
    );
  }

  /* --- Nivel 6: balance --- */
  const balance = document.getElementById("balance-bar");
  if (balance) {
    let left = 50;
    const leftBtn = document.getElementById("balance-left");
    const rightBtn = document.getElementById("balance-right");
    const indicator = document.getElementById("balance-indicator");
    function render() {
      if (indicator) indicator.style.left = left + "%";
    }
    leftBtn?.addEventListener("click", () => { left = Math.max(0, left - 8); render(); });
    rightBtn?.addEventListener("click", () => { left = Math.min(100, left + 8); render(); });
    document.getElementById("balance-submit")?.addEventListener("click", () =>
      submitPayload({ position: left }),
    );
    render();
  }

  /* --- Nivel 8 / wait --- */
  if (uiType === "wait" || uiType === "silence" || levelId === 8) {
    const duration = parseInt(form.dataset.duration || "15000", 10);
    const candle = document.getElementById("candle");
    const bar = document.getElementById("wait-progress");
    let clickCount = 0;
    const start = Date.now();
    const timer = setInterval(() => {
      if (clickCount > 0) return;
      const elapsed = Date.now() - start;
      if (bar) bar.style.width = Math.min(100, (elapsed / duration) * 100) + "%";
      if (elapsed >= duration) {
        clearInterval(timer);
        submitPayload({ waitedMs: elapsed, clickCount: 0 });
      }
    }, 400);
    candle?.addEventListener("click", () => {
      clickCount += 1;
      if (candle) candle.classList.add("extinguished");
      submitPayload({ waitedMs: Date.now() - start, clickCount });
    });
  }

  /* --- choice / cards genéricos --- */
  document.querySelectorAll("[data-choice-id]").forEach((btn) => {
    btn.addEventListener("click", () => submitPayload({ choiceId: btn.dataset.choiceId }));
  });
  document.querySelectorAll("[data-option-index]").forEach((btn) => {
    btn.addEventListener("click", () =>
      submitPayload({ optionIndex: parseInt(btn.dataset.optionIndex, 10) }),
    );
  });

  /* --- red_button --- */
  document.getElementById("red-button")?.addEventListener("click", () =>
    submitPayload({ pressed: true }),
  );

  /* --- empty_submit --- */
  document.getElementById("empty-submit")?.addEventListener("click", () => submitPayload({}));

  /* --- confirmation --- */
  document.getElementById("confirm-yes")?.addEventListener("click", () =>
    submitPayload({ confirmed: true }),
  );
  document.getElementById("confirm-no")?.addEventListener("click", () =>
    submitPayload({ confirmed: false }),
  );

  /* --- texto genérico --- */
  document.getElementById("text-submit")?.addEventListener("click", (e) => {
    e.preventDefault();
    const val = document.getElementById("text-answer")?.value ?? "";
    if (uiType === "final_destination") {
      submitPayload({ coordinates: val });
    } else {
      submitPayload({ answer: val });
    }
  });
})();
