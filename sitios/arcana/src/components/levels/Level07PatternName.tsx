"use client";

import { useState, useEffect } from "react";

interface Level07Props {
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

export function Level07PatternName({ params, onSubmit }: Level07Props) {
  const displayName = (params.displayName as string) ?? "";
  const pattern = (params.pattern as string) ?? displayName;
  const showDurationMs = (params.showDurationMs as number) ?? 3000;
  const [phase, setPhase] = useState<"show" | "pattern" | "input">("show");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (phase === "show") {
      const t = setTimeout(() => setPhase("pattern"), showDurationMs);
      return () => clearTimeout(t);
    }
    if (phase === "pattern") {
      const t = setTimeout(() => setPhase("input"), showDurationMs);
      return () => clearTimeout(t);
    }
  }, [phase, showDurationMs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await onSubmit({ answer });
    setMessage(result.success ? "El nombre responde." : (result.message ?? "Incorrecto."));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {phase === "show" && (
        <p className="narrative-text text-2xl fade-in">{displayName}</p>
      )}
      {phase === "pattern" && (
        <p className="terminal-text text-lg tracking-widest fade-in">{pattern}</p>
      )}
      {phase === "input" && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="input-arcane w-56"
            placeholder="Nombre invertido..."
            aria-label="Nombre al revés"
            autoFocus
          />
          <button type="button" className="btn-arcane" onClick={handleSubmit}>Enviar</button>
        </form>
      )}
      {message && <p className="narrative-text text-[var(--text-muted)]">{message}</p>}
    </div>
  );
}
