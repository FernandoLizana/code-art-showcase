"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GameShell } from "@/components/layout/GameShell";

export default function AdvertenciaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });
      if (res.ok) {
        router.push("/prueba");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <GameShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="panel-arcane max-w-lg fade-in">
          <p className="terminal-text mb-6 text-xs uppercase tracking-widest text-[var(--accent-red)]">
            Advertencia
          </p>
          <div className="narrative-text space-y-4 text-[var(--text-muted)]">
            <p>Lo que sigue no es un juego. Tampoco es un sueño.</p>
            <p>
              Algunas puertas, una vez abiertas, no pueden cerrarse del mismo modo.
              No busques respuestas fuera de este archivo.
            </p>
            <p className="text-[var(--text-faint)]">
              No se recopilará tu ubicación, cámara ni micrófono.
              Lo que escribas aquí permanece aquí.
            </p>
          </div>
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={handleContinue}
              disabled={loading}
              className="btn-arcane"
            >
              {loading ? "..." : "Comprendo"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-arcane opacity-50"
            >
              Retirarme
            </button>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
