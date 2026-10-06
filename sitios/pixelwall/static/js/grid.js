/**
 * PixelWall Ads — Motor de grilla interactiva (Canvas).
 * Modos: public (solo lectura) y buy (selección rectangular con reemplazo).
 */
const PixelGrid = (() => {
  const COLORS = {
    available: '#1a1a2e',
    gridLine: 'rgba(0, 255, 204, 0.06)',
    occupied: 'rgba(255, 170, 0, 0.35)',
    occupiedBorder: 'rgba(255, 170, 0, 0.7)',
    reserved: 'rgba(255, 68, 102, 0.55)',
    reservedBorder: 'rgba(255, 68, 102, 0.8)',
    selected: 'rgba(0, 255, 204, 0.45)',
    selectedTakeover: 'rgba(255, 170, 0, 0.5)',
    selectedBorder: '#00ffcc',
    selectedTakeoverBorder: '#ffaa00',
    invalid: 'rgba(255, 68, 102, 0.35)',
  };

  function cellFromEvent(canvas, cellSize, e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    return {
      x: Math.floor(px / cellSize),
      y: Math.floor(py / cellSize),
    };
  }

  function normalizeRect(x1, y1, x2, y2) {
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    return {
      x,
      y,
      width: Math.abs(x2 - x1) + 1,
      height: Math.abs(y2 - y1) + 1,
    };
  }

  function overlaps(a, b) {
    return !(
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
    );
  }

  function setupCanvas(container, gridW, gridH, cellSize) {
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = gridW * cellSize;
    canvas.height = gridH * cellSize;
    container.appendChild(canvas);
    return canvas;
  }

  function drawGridLines(ctx, gridW, gridH, cellSize) {
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= gridW; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, gridH * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y <= gridH; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(gridW * cellSize, y * cellSize);
      ctx.stroke();
    }
  }

  function drawAds(ctx, ads, fill, border, cellSize) {
    ads.forEach((ad) => {
      ctx.fillStyle = fill;
      ctx.fillRect(ad.x * cellSize, ad.y * cellSize, ad.width * cellSize, ad.height * cellSize);
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(ad.x * cellSize, ad.y * cellSize, ad.width * cellSize, ad.height * cellSize);
    });
  }

  function drawSelection(ctx, sel, cellSize, valid, isTakeover) {
    if (!sel || sel.width < 1 || sel.height < 1) return;
    const takeover = valid && isTakeover;
    ctx.fillStyle = !valid ? COLORS.invalid : (takeover ? COLORS.selectedTakeover : COLORS.selected);
    ctx.fillRect(sel.x * cellSize, sel.y * cellSize, sel.width * cellSize, sel.height * cellSize);
    ctx.strokeStyle = !valid ? COLORS.reservedBorder : (takeover ? COLORS.selectedTakeoverBorder : COLORS.selectedBorder);
    ctx.lineWidth = 2;
    ctx.strokeRect(sel.x * cellSize, sel.y * cellSize, sel.width * cellSize, sel.height * cellSize);
  }

  function drawPublicAds(ctx, ads, cellSize, imageCache, pulse = 1) {
    ads.forEach((ad) => {
      const px = ad.x * cellSize;
      const py = ad.y * cellSize;
      const pw = ad.width * cellSize;
      const ph = ad.height * cellSize;
      const life = ad.life_status || 'vivo';

      ctx.save();

      if (life === 'muerto') {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, pw, ph);
        ctx.fillStyle = '#555';
        ctx.font = `bold ${Math.max(8, Math.min(pw, ph) * 0.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', px + pw / 2, py + ph / 2);
        ctx.restore();
        return;
      }

      if (life === 'moribundo') {
        ctx.globalAlpha = 0.35 + pulse * 0.35;
      }

      if (ad.image_path && imageCache[ad.image_path]) {
        ctx.drawImage(imageCache[ad.image_path], px, py, pw, ph);
      } else {
        ctx.fillStyle = ad.background_color || '#00ffcc';
        ctx.fillRect(px, py, pw, ph);
      }

      if (life === 'moribundo') {
        ctx.fillStyle = 'rgba(255, 68, 0, 0.35)';
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = `rgba(255, 170, 0, ${0.5 + pulse * 0.5})`;
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      }

      ctx.lineWidth = life === 'moribundo' ? 2 : 1;
      ctx.strokeRect(px, py, pw, ph);
      ctx.restore();
    });
  }

  function preloadImages(ads) {
    const cache = {};
    const promises = ads
      .filter((ad) => ad.image_path)
      .map(
        (ad) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              cache[ad.image_path] = img;
              resolve();
            };
            img.onerror = resolve;
            img.src = `/static/${ad.image_path}`;
          })
      );
    return Promise.all(promises).then(() => cache);
  }

  function adAtCell(ads, cx, cy) {
    return ads.find(
      (ad) =>
        cx >= ad.x && cx < ad.x + ad.width && cy >= ad.y && cy < ad.y + ad.height
    );
  }

  function createTooltip() {
    const el = document.createElement('div');
    el.className = 'pixel-tooltip';
    el.hidden = true;
    document.body.appendChild(el);
    return el;
  }

  function selectionOverlapsOccupied(sel, occupiedAds) {
    return occupiedAds.some((ad) => overlaps(sel, ad));
  }

  // ── Modo público ──────────────────────────────────────────────

  function initPublic(selector, ads) {
    const container = document.querySelector(selector);
    if (!container) return;

    const gridW = parseInt(container.dataset.gridWidth, 10);
    const gridH = parseInt(container.dataset.gridHeight, 10);
    const cellSize = parseInt(container.dataset.cellSize, 10);
    const canvas = setupCanvas(container, gridW, gridH, cellSize);
    const ctx = canvas.getContext('2d');
    const tooltip = createTooltip();
    let imageCache = {};
    let pulse = 0;
    let animId = null;

    function render() {
      pulse = (Math.sin(Date.now() / 400) + 1) / 2;
      ctx.fillStyle = COLORS.available;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGridLines(ctx, gridW, gridH, cellSize);
      drawPublicAds(ctx, ads, cellSize, imageCache, pulse);
    }

    function startAnim() {
      if (animId) return;
      const loop = () => {
        const hasDying = ads.some((a) => a.life_status === 'moribundo');
        if (hasDying) render();
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }

    preloadImages(ads).then((cache) => {
      imageCache = cache;
      render();
      startAnim();
    });

    canvas.addEventListener('mousemove', (e) => {
      const cell = cellFromEvent(canvas, cellSize, e);
      const ad = adAtCell(ads, cell.x, cell.y);
      if (ad) {
        const life = ad.life_status || 'vivo';
        tooltip.hidden = false;
        tooltip.className = 'pixel-tooltip';
        if (life === 'muerto') {
          tooltip.classList.add('pixel-tooltip--dead');
          tooltip.innerHTML = `<strong>💀 MUERTO</strong>${escapeHtml(ad.advertiser_name)} — no pagó la cuota`;
          canvas.style.cursor = 'not-allowed';
        } else if (life === 'moribundo') {
          tooltip.classList.add('pixel-tooltip--dying');
          tooltip.innerHTML = `<strong>⚠️ MURIENDO</strong>${escapeHtml(ad.title)} — renueva o desaparece`;
          canvas.style.cursor = 'not-allowed';
        } else {
          tooltip.innerHTML = `<strong>${escapeHtml(ad.title)}</strong>${escapeHtml(ad.advertiser_name || '')}`;
          canvas.style.cursor = 'pointer';
        }
        tooltip.style.left = `${e.clientX + 12}px`;
        tooltip.style.top = `${e.clientY + 12}px`;
      } else {
        tooltip.hidden = true;
        canvas.style.cursor = 'default';
      }
    });

    canvas.addEventListener('mouseleave', () => {
      tooltip.hidden = true;
    });

    canvas.addEventListener('click', (e) => {
      const cell = cellFromEvent(canvas, cellSize, e);
      const ad = adAtCell(ads, cell.x, cell.y);
      if (ad && ad.life_status === 'vivo' && ad.target_url) {
        window.open(ad.target_url, '_blank', 'noopener');
      }
    });
  }

  // ── Modo compra ───────────────────────────────────────────────

  function initBuy(selector, occupiedAds, pendingAds) {
    const container = document.querySelector(selector);
    if (!container) return;

    const gridW = parseInt(container.dataset.gridWidth, 10);
    const gridH = parseInt(container.dataset.gridHeight, 10);
    const cellSize = parseInt(container.dataset.cellSize, 10);

    const canvas = setupCanvas(container, gridW, gridH, cellSize);
    const ctx = canvas.getContext('2d');

    let startCell = null;
    let endCell = null;
    let isDragging = false;
    let currentSel = null;
    let selectionValid = false;
    let isTakeover = false;

    const infoEl = document.getElementById('selection-info');
    const priceEl = document.getElementById('selection-price');
    const errorEl = document.getElementById('selection-error');
    const noticeEl = document.getElementById('selection-notice');
    const submitBtn = document.getElementById('submit-btn');
    const fieldX = document.getElementById('field-x');
    const fieldY = document.getElementById('field-y');
    const fieldW = document.getElementById('field-width');
    const fieldH = document.getElementById('field-height');
    const summaryCells = document.getElementById('summary-cells');
    const summaryPrice = document.getElementById('summary-price');
    const summaryPremium = document.getElementById('summary-premium');

    function getSelection() {
      if (!startCell) return null;
      const end = endCell || startCell;
      return normalizeRect(startCell.x, startCell.y, end.x, end.y);
    }

    function isLocalValid(sel) {
      if (!sel) return false;
      if (sel.x + sel.width > gridW || sel.y + sel.height > gridH) return false;
      return !pendingAds.some((ad) => overlaps(sel, ad));
    }

    function render() {
      ctx.fillStyle = COLORS.available;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawGridLines(ctx, gridW, gridH, cellSize);
      drawAds(ctx, occupiedAds, COLORS.occupied, COLORS.occupiedBorder, cellSize);
      drawAds(ctx, pendingAds, COLORS.reserved, COLORS.reservedBorder, cellSize);
      currentSel = getSelection();
      selectionValid = isLocalValid(currentSel);
      isTakeover = currentSel && selectionValid && selectionOverlapsOccupied(currentSel, occupiedAds);
      drawSelection(ctx, currentSel, cellSize, selectionValid, isTakeover);
    }

    function updateUI() {
      currentSel = getSelection();
      if (!currentSel) {
        infoEl.textContent = 'Selecciona un bloque en la grilla';
        priceEl.textContent = '';
        errorEl.hidden = true;
        noticeEl.hidden = true;
        submitBtn.disabled = true;
        summaryCells.textContent = '0';
        summaryPrice.textContent = '$0 CLP';
        summaryPremium.hidden = true;
        return;
      }

      const cells = currentSel.width * currentSel.height;
      infoEl.textContent = `${currentSel.width}×${currentSel.height} — ${cells} celdas en (${currentSel.x}, ${currentSel.y})`;

      if (!selectionValid) {
        const outOfBounds =
          currentSel.x + currentSel.width > gridW ||
          currentSel.y + currentSel.height > gridH;
        errorEl.textContent = outOfBounds
          ? 'La selección se sale de los límites de la grilla.'
          : 'Hay una reserva pendiente en esa zona.';
        errorEl.hidden = false;
        noticeEl.hidden = true;
        submitBtn.disabled = true;
        priceEl.textContent = '';
        summaryCells.textContent = cells;
        summaryPrice.textContent = '$0 CLP';
        summaryPremium.hidden = true;
        fieldX.value = '';
        fieldY.value = '';
        fieldW.value = '';
        fieldH.value = '';
        return;
      }

      errorEl.hidden = true;

      fetch('/api/validate-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSel),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) {
            priceEl.textContent = `$${data.total_price.toLocaleString('es-CL')} CLP`;
            summaryCells.textContent = data.cell_count;
            summaryPrice.textContent = `$${data.total_price.toLocaleString('es-CL')} CLP`;

            if (data.is_takeover) {
              noticeEl.textContent = data.message;
              noticeEl.hidden = false;
              summaryPremium.hidden = false;
              summaryPremium.textContent =
                `${data.premium_cells} celda(s) con precio escalonado (hasta ${data.max_tier}x)`;
            } else {
              noticeEl.hidden = true;
              summaryPremium.hidden = true;
            }

            submitBtn.disabled = false;
            fieldX.value = currentSel.x;
            fieldY.value = currentSel.y;
            fieldW.value = currentSel.width;
            fieldH.value = currentSel.height;
          } else {
            errorEl.textContent = data.message;
            errorEl.hidden = false;
            noticeEl.hidden = true;
            submitBtn.disabled = true;
          }
        })
        .catch(() => {
          submitBtn.disabled = selectionValid;
          if (selectionValid) {
            fieldX.value = currentSel.x;
            fieldY.value = currentSel.y;
            fieldW.value = currentSel.width;
            fieldH.value = currentSel.height;
          }
        });
    }

    function onPointerDown(e) {
      const cell = cellFromEvent(canvas, cellSize, e);
      if (cell.x < 0 || cell.x >= gridW || cell.y < 0 || cell.y >= gridH) return;
      startCell = cell;
      endCell = cell;
      isDragging = true;
      render();
      updateUI();
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      endCell = cellFromEvent(canvas, cellSize, e);
      render();
      updateUI();
    }

    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      render();
      updateUI();
    }

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onPointerDown(e.touches[0]);
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      onPointerMove(e.touches[0]);
    }, { passive: false });
    canvas.addEventListener('touchend', onPointerUp);

    render();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { initPublic, initBuy };
})();
