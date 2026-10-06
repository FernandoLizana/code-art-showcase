"use client";

import { useState, useRef, useCallback } from "react";

interface Level03Props {
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

export function Level03BlackRoom({ params, onSubmit }: Level03Props) {
  const hiddenZone = params.hiddenZone as { x: number; y: number; width: number; height: number };
  const [visible, setVisible] = useState(false);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const inZone =
        x >= hiddenZone.x &&
        x <= hiddenZone.x + hiddenZone.width &&
        y >= hiddenZone.y &&
        y <= hiddenZone.y + hiddenZone.height;
      setVisible(inZone);
    },
    [hiddenZone],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await onSubmit({ answer });
    if (result.success) {
      setMessage("Algo responde desde la oscuridad.");
    } else {
      setMessage(result.message ?? "La oscuridad no reconoce eso.");
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative h-96 w-full max-w-lg bg-black mx-auto cursor-crosshair"
      onMouseMove={handleMouseMove}
      role="application"
      aria-label="Habitación negra"
    >
      <p className="sr-only">
        Mueve el cursor por la pantalla negra para encontrar un campo oculto.
      </p>
      {visible && (
        <form
          onSubmit={handleSubmit}
          className="absolute left-1/2 top-[55%] -translate-x-1/2 w-48 fade-in"
          style={{ opacity: visible ? 0.15 : 0 }}
        >
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="input-arcane bg-transparent border-[var(--text-faint)] text-[var(--text-faint)] w-full"
            aria-label="Respuesta oculta"
            autoFocus
          />
        </form>
      )}
      {message && (
        <p className="absolute bottom-4 left-0 right-0 text-center narrative-text text-[var(--text-muted)]">
          {message}
        </p>
      )}
    </div>
  );
}
