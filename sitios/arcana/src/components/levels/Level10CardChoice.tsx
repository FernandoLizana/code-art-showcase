"use client";

import { useState } from "react";

interface Card {
  id: string;
  name: string;
  desc: string;
}

interface Level10Props {
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

export function Level10CardChoice({ params, onSubmit }: Level10Props) {
  const cards = (params.cards as Card[]) ?? [];
  const [message, setMessage] = useState("");

  async function handleChoice(id: string) {
    const result = await onSubmit({ choice: id });
    setMessage(result.success ? "El umbral acepta tu elección." : (result.message ?? ""));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => handleChoice(card.id)}
            className="panel-arcane p-4 text-left cursor-pointer hover:border-[var(--accent-gold-dim)] transition-colors"
          >
            <p className="narrative-text text-lg mb-2">{card.name}</p>
            <p className="terminal-text text-xs text-[var(--text-faint)]">{card.desc}</p>
          </button>
        ))}
      </div>
      {message && <p className="narrative-text text-[var(--accent-gold)]">{message}</p>}
    </div>
  );
}
