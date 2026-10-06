"use client";

import { useEffect, useState } from "react";
import { GameShell } from "@/components/layout/GameShell";

function loadA11yPrefs() {
  if (typeof window === "undefined") return { fontSize: "medium", reducedMotion: false };
  const saved = localStorage.getItem("arcana_a11y");
  if (saved) {
    const prefs = JSON.parse(saved);
    return { fontSize: prefs.fontSize ?? "medium", reducedMotion: prefs.reducedMotion ?? false };
  }
  return { fontSize: "medium", reducedMotion: false };
}

export default function ConfiguracionPage() {
  const [recoveryCode, setRecoveryCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [message, setMessage] = useState("");
  const [fontSize, setFontSize] = useState(() => loadA11yPrefs().fontSize);
  const [reducedMotion, setReducedMotion] = useState(() => loadA11yPrefs().reducedMotion);

  useEffect(() => {
    fetch("/api/personality/result")
      .then((r) => r.json())
      .then((d) => {
        if (d.recoveryCode) setRecoveryCode(d.recoveryCode);
      });
  }, []);

  function saveA11y() {
    localStorage.setItem("arcana_a11y", JSON.stringify({ fontSize, reducedMotion }));
    document.documentElement.style.fontSize =
      fontSize === "large" ? "18px" : fontSize === "small" ? "14px" : "16px";
    if (reducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
    setMessage("Preferencias guardadas.");
  }

  async function recover() {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "recover", recoveryCode: importCode }),
    });
    if (res.ok) {
      setMessage("Partida recuperada.");
      window.location.href = "/umbral";
    } else {
      setMessage("Código no encontrado.");
    }
  }

  return (
    <GameShell showNav>
      <div className="mx-auto max-w-lg px-6 py-12">
        <h1 className="narrative-text text-2xl mb-8">Configuración</h1>

        <section className="panel-arcane mb-6">
          <h2 className="terminal-text text-xs mb-4 uppercase">Recuperación</h2>
          {recoveryCode && (
            <p className="terminal-text mb-2">
              Tu código: <span className="text-[var(--accent-gold)]">{recoveryCode}</span>
            </p>
          )}
          <input
            type="text"
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            className="input-arcane mb-2"
            placeholder="Importar código..."
            aria-label="Código de recuperación"
          />
          <button type="button" onClick={recover} className="btn-arcane">
            Recuperar partida
          </button>
        </section>

        <section className="panel-arcane mb-6">
          <h2 className="terminal-text text-xs mb-4 uppercase">Accesibilidad</h2>
          <label className="block mb-2 terminal-text text-sm">
            Tamaño de texto
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="input-arcane mt-1"
            >
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </label>
          <label className="flex items-center gap-2 terminal-text text-sm">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
            />
            Reducir animaciones
          </label>
          <button type="button" onClick={saveA11y} className="btn-arcane mt-4">
            Guardar
          </button>
        </section>

        {message && <p className="terminal-text text-[var(--text-muted)]">{message}</p>}
      </div>
    </GameShell>
  );
}
