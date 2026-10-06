"use client";

import { useState } from "react";
import { GameShell } from "@/components/layout/GameShell";

interface AdminData {
  stats: { sessions: number; attempts: number; completed: number; implemented: number; totalLevels: number };
  config: { gameName: string; finalLabel: string; coordsValid: boolean; devMode: boolean };
  abandonment: { levelId: number; _count: { levelId: number }; _avg: { attempts: number | null } }[];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [devLevel, setDevLevel] = useState("1");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      loadStats();
    } else {
      setError("Acceso denegado.");
    }
  }

  async function loadStats() {
    const res = await fetch("/api/admin");
    if (res.ok) setData(await res.json());
  }

  if (!authed) {
    return (
      <GameShell>
        <div className="flex flex-1 items-center justify-center px-6">
          <form onSubmit={login} className="panel-arcane w-full max-w-sm">
            <h1 className="terminal-text text-xs mb-4 uppercase">Panel del creador</h1>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-arcane mb-4 w-full"
              placeholder="Contraseña"
            />
            <button type="submit" className="btn-arcane w-full">Entrar</button>
            {error && <p className="terminal-text text-xs text-[var(--accent-red)] mt-2">{error}</p>}
            <p className="terminal-text text-[10px] text-[var(--text-faint)] mt-4">Dev: arcana-dev</p>
          </form>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="narrative-text text-2xl mb-6">Administración — {data?.config.gameName}</h1>
        {data && (
          <>
            <section className="panel-arcane mb-6 grid grid-cols-2 gap-4 terminal-text text-sm">
              <p>Sesiones: {data.stats.sessions}</p>
              <p>Intentos: {data.stats.attempts}</p>
              <p>Completados: {data.stats.completed}</p>
              <p>Niveles: {data.stats.implemented}/{data.stats.totalLevels}</p>
              <p className="col-span-2">Destino: {data.config.finalLabel} {data.config.coordsValid ? "✓" : "⚠"}</p>
            </section>
            <section className="panel-arcane mb-6">
              <h2 className="terminal-text text-xs mb-3 uppercase">Abandono (más intentos)</h2>
              {data.abandonment.map((a) => (
                <p key={a.levelId} className="terminal-text text-xs">
                  Nivel {a.levelId}: {a._count.levelId} sesiones, ~{Math.round(a._avg.attempts ?? 0)} intentos
                </p>
              ))}
            </section>
            <section className="panel-arcane mb-6">
              <h2 className="terminal-text text-xs mb-3 uppercase">Modo desarrollo</h2>
              <div className="flex gap-2">
                <input type="number" min="1" max="100" value={devLevel} onChange={(e) => setDevLevel(e.target.value)} className="input-arcane w-24" />
                <a href={`/nivel/${devLevel}`} className="btn-arcane inline-block">Saltar a nivel</a>
              </div>
            </section>
          </>
        )}
        <button type="button" className="btn-arcane" onClick={loadStats}>Actualizar</button>
      </div>
    </GameShell>
  );
}
