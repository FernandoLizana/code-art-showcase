/** Huella de dispositivo (localStorage) */
(function () {
  const KEY = "arcana_fp";
  let fp = localStorage.getItem(KEY);
  if (!fp) {
    fp = "fp_" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    localStorage.setItem(KEY, fp);
  }
  window.ARCANA_FP = fp;

  fetch("/api/device", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fingerprint: fp }),
    credentials: "same-origin",
  }).catch(function () {});
})();
