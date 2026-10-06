"use client";

import { useState } from "react";

interface Level06Props {
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

export function Level06Balance({ params, onSubmit }: Level06Props) {
  const leftLabel = (params.leftLabel as string) ?? "izquierda";
  const rightLabel = (params.rightLabel as string) ?? "derecha";
  const leftItems = (params.leftItems as string[]) ?? [];
  const rightItems = (params.rightItems as string[]) ?? [];
  const [left, setLeft] = useState<string[]>([]);
  const [right, setRight] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  function moveTo(side: "left" | "right", word: string) {
    if (side === "left") setLeft((p) => [...p, word]);
    else setRight((p) => [...p, word]);
  }

  async function handleSubmit() {
    const result = await onSubmit({ left, right });
    setMessage(result.success ? "La balanza cede." : (result.message ?? "Desequilibrio."));
  }

  const available = [...leftItems, ...rightItems].filter(
    (w) => !left.includes(w) && !right.includes(w),
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-8 w-full max-w-lg">
        <div className="flex-1 panel-arcane min-h-32">
          <p className="terminal-text text-xs mb-2">{leftLabel}</p>
          {left.map((w, i) => (
            <span key={i} className="block text-sm narrative-text capitalize">{w}</span>
          ))}
        </div>
        <div className="flex-1 panel-arcane min-h-32">
          <p className="terminal-text text-xs mb-2">{rightLabel}</p>
          {right.map((w, i) => (
            <span key={i} className="block text-sm narrative-text capitalize">{w}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {available.map((w) => (
          <span key={w} className="flex gap-1">
            <button type="button" className="btn-arcane text-xs" onClick={() => moveTo("left", w)}>← {w}</button>
            <button type="button" className="btn-arcane text-xs" onClick={() => moveTo("right", w)}>{w} →</button>
          </span>
        ))}
      </div>
      <button type="button" className="btn-arcane" onClick={handleSubmit}>Equilibrar</button>
      {message && <p className="narrative-text text-[var(--text-muted)]">{message}</p>}
    </div>
  );
}
