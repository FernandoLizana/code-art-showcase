"use client";

import { useState } from "react";

interface Level01Props {
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

const MARKS = ["I", "II", "III", "IV", "V", "VI", "VII"];

export function Level01Door({ params, onSubmit }: Level01Props) {
  const [activeMark, setActiveMark] = useState<number | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [message, setMessage] = useState("");
  const clickPenalty = params.clickPenalty as boolean;
  const waitWindow = params.waitWindow as { enabled: boolean; durationMs: number; startDelayMs: number };

  const handleMarkHover = (index: number) => {
    setActiveMark(index);
  };

  const handleMarkClick = async (index: number) => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    const result = await onSubmit({ markIndex: index, clickCount: newCount });
    if (result.success) {
      setMessage("La puerta cede.");
    } else {
      setMessage(result.message ?? "La marca reacciona, pero no cede.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative mb-12 h-64 w-48 border border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
        role="img"
        aria-label="Puerta con siete marcas"
      >
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-around px-2">
          {MARKS.map((mark, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => handleMarkHover(i)}
              onFocus={() => handleMarkHover(i)}
              onClick={() => handleMarkClick(i)}
              className={`terminal-text text-sm transition-all duration-300 cursor-pointer ${
                activeMark === i
                  ? "text-[var(--accent-gold)] scale-110"
                  : "text-[var(--text-faint)] hover:text-[var(--text-muted)]"
              }`}
              aria-label={`Marca ${mark}`}
            >
              {mark}
            </button>
          ))}
        </div>
      </div>
      {clickPenalty && clickCount > 2 && (
        <p className="terminal-text text-xs text-[var(--accent-red)] mb-4">
          Demasiado prisa...
        </p>
      )}
      {waitWindow?.enabled && (
        <p className="terminal-text text-xs text-[var(--text-faint)] mb-4">
          Algo cambia si esperas...
        </p>
      )}
      {message && <p className="narrative-text text-[var(--text-muted)]">{message}</p>}
    </div>
  );
}
