"use client";

import { useState, useRef, useEffect } from "react";
import { deriveSequenceFromSeed } from "@/lib/security/seed";

interface Level04Props {
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

const SYMBOL_POOL = ["☉", "☽", "△", "▽", "○", "□"];

export function Level04Eye({ params, onSubmit }: Level04Props) {
  const levelSeed = (params.levelSeed as string) ?? "";
  const expectedSequence = deriveSequenceFromSeed(levelSeed, 4, SYMBOL_POOL);

  const [isWatching, setIsWatching] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [currentSymbol, setCurrentSymbol] = useState("");
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isWatching) {
      if (revealTimer.current) clearTimeout(revealTimer.current);
      return;
    }
    if (revealedCount >= expectedSequence.length) return;

    revealTimer.current = setTimeout(() => {
      setCurrentSymbol(expectedSequence[revealedCount]);
      setRevealedCount((c) => c + 1);
    }, 800);

    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, [isWatching, revealedCount, expectedSequence]);

  const displayedSymbol = isWatching ? "" : currentSymbol;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const revealed = expectedSequence.slice(0, revealedCount);
    const result = await onSubmit({ sequence: input, symbols: revealed });
    if (result.success) {
      setMessage("El ojo parpadea una última vez.");
    } else {
      setMessage(result.message ?? "El ojo no reconoce esa secuencia.");
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative mb-8 h-32 w-32"
        onMouseEnter={() => setIsWatching(true)}
        onMouseLeave={() => setIsWatching(false)}
        onFocus={() => setIsWatching(true)}
        onBlur={() => setIsWatching(false)}
        tabIndex={0}
        role="img"
        aria-label="Ojo que se cierra al observarlo"
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <ellipse
            cx="50"
            cy="50"
            rx="40"
            ry="25"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1"
          />
          <circle
            cx="50"
            cy="50"
            r={isWatching ? 5 : 15}
            fill="var(--accent-gold-dim)"
            className="transition-all duration-300"
          />
          {isWatching && (
            <line
              x1="10"
              y1="50"
              x2="90"
              y2="50"
              stroke="var(--text-faint)"
              strokeWidth="2"
              className="transition-all duration-300"
            />
          )}
        </svg>
      </div>

      {!isWatching && displayedSymbol && (
        <p className="terminal-text text-2xl mb-4 fade-in" aria-live="polite">
          {displayedSymbol}
        </p>
      )}

      <p className="terminal-text text-xs text-[var(--text-faint)] mb-4">
        {isWatching ? "Cierra..." : "Aparta la mirada y recuerda"}
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-arcane w-48"
          placeholder="Secuencia..."
          aria-label="Secuencia de símbolos"
        />
        <button type="submit" className="btn-arcane">
          Enviar
        </button>
      </form>

      {message && <p className="narrative-text mt-4 text-[var(--text-muted)]">{message}</p>}
    </div>
  );
}
