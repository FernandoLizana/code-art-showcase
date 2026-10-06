"use client";

import { useState } from "react";
import { MAJOR_ARCANA } from "@/lib/tarot/constants";

interface SpreadCard {
  id: number;
  name: string;
  slug: string;
}

interface Level02Props {
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

export function Level02MissingCard({ params, onSubmit }: Level02Props) {
  const spread = (params.spread as SpreadCard[]) ?? [];
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  async function handleSelect(cardId: number, cardName: string) {
    setSelected(cardId);
    const result = await onSubmit({ cardId, cardName });
    if (result.success) {
      setMessage("El mazo reconoce la ausencia.");
    } else {
      setMessage(result.message ?? "Ese arcano ya está presente.");
      setSelected(null);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 grid grid-cols-5 gap-2 max-w-lg">
        {spread.map((card) => (
          <div
            key={card.id}
            className="panel-arcane p-2 text-center text-xs narrative-text text-[var(--text-muted)]"
          >
            <span className="terminal-text block text-[10px] mb-1">{card.id}</span>
            {card.name}
          </div>
        ))}
      </div>
      <p className="terminal-text text-xs text-[var(--text-faint)] mb-4">
        {spread.length} arcanos visibles
      </p>
      {!showPicker ? (
        <button type="button" onClick={() => setShowPicker(true)} className="btn-arcane">
          Nombrar la ausencia
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-w-md max-h-64 overflow-y-auto">
          {MAJOR_ARCANA.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => handleSelect(card.id, card.name)}
              disabled={spread.some((s) => s.id === card.id)}
              className={`panel-arcane p-2 text-xs text-left cursor-pointer transition-colors ${
                spread.some((s) => s.id === card.id)
                  ? "opacity-30 cursor-not-allowed"
                  : selected === card.id
                    ? "border-[var(--accent-gold)]"
                    : "hover:border-[var(--accent-gold-dim)]"
              }`}
            >
              {card.name}
            </button>
          ))}
        </div>
      )}
      {message && <p className="narrative-text mt-4 text-[var(--text-muted)]">{message}</p>}
    </div>
  );
}
