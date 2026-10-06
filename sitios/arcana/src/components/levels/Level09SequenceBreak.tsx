"use client";

import { useState } from "react";

interface Level09Props {
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

export function Level09SequenceBreak({ params, onSubmit }: Level09Props) {
  const sequence = (params.sequence as number[]) ?? [];
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function handleSelect(index: number) {
    setSelected(index);
    const result = await onSubmit({ selectedIndex: index, selectedValue: sequence[index] });
    setMessage(result.success ? "El intruso revelado." : (result.message ?? "Ese número obedece."));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {sequence.map((n, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelect(i)}
            className={`panel-arcane w-14 h-14 text-lg cursor-pointer ${
              selected === i ? "border-[var(--accent-gold)]" : ""
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="terminal-text text-xs text-[var(--text-faint)]">Selecciona el número incorrecto</p>
      {message && <p className="narrative-text text-[var(--text-muted)]">{message}</p>}
    </div>
  );
}
