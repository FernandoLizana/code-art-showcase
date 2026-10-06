"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { GameShell } from "@/components/layout/GameShell";
import { LevelRenderer } from "@/components/levels/LevelRenderer";

interface LevelData {
  level: {
    id: number;
    title: string;
    act: number;
    mechanic: string;
    narrativeEntry: string;
    hintsAvailable: number;
    hintsUsed: number;
  };
  variant: {
    modifier: string;
    params: Record<string, unknown>;
  };
  completed: boolean;
}

export default function NivelPage() {
  const params = useParams();
  const levelNum = parseInt(params.numero as string, 10);
  const [data, setData] = useState<LevelData | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/nivel/${levelNum}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setData(d);
        setCompleted(d.completed);
      });
  }, [levelNum]);

  const onSubmit = useCallback(
    async (payload: unknown) => {
      const res = await fetch(`/api/nivel/${levelNum}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "answer", payload }),
      });
      const result = await res.json();
      if (result.success) setCompleted(true);
      return result;
    },
    [levelNum],
  );

  async function requestHint(hintId: number) {
    const res = await fetch(`/api/nivel/${levelNum}/pista`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hintId }),
    });
    const result = await res.json();
    if (result.text) setHint(result.text);
  }

  if (error) {
    return (
      <GameShell showNav>
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="narrative-text text-[var(--accent-red)]">{error}</p>
          <Link href="/umbral" className="btn-arcane mt-4">Volver</Link>
        </div>
      </GameShell>
    );
  }

  if (!data) {
    return (
      <GameShell showNav>
        <div className="flex flex-1 items-center justify-center terminal-text">...</div>
      </GameShell>
    );
  }

  return (
    <GameShell showNav>
      <div className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <p className="terminal-text text-xs mb-2">Acto {data.level.act} — Nivel {data.level.id}</p>
          <h1 className="narrative-text text-2xl mb-4">{data.level.title}</h1>
          <p className="narrative-text text-[var(--text-muted)] mb-8">{data.level.narrativeEntry}</p>

          <LevelRenderer
            levelId={levelNum}
            mechanic={data.level.mechanic}
            params={data.variant.params}
            onSubmit={onSubmit}
          />

          <div className="mt-8 flex gap-2">
            {[1, 2, 3].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => requestHint(id)}
                disabled={data.level.hintsUsed >= id}
                className="btn-arcane text-xs opacity-60"
              >
                Pista {id}
              </button>
            ))}
          </div>
          {hint && <p className="narrative-text mt-4 text-[var(--text-faint)] italic">{hint}</p>}

          {completed && (
            <div className="mt-8 panel-arcane fade-in">
              <p className="narrative-text text-[var(--accent-gold)] mb-4">Umbral cruzado.</p>
              {levelNum < 100 ? (
                <Link href={`/nivel/${levelNum + 1}`} className="btn-arcane">Siguiente</Link>
              ) : (
                <Link href="/final" className="btn-arcane">El lugar</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}
