"use client";

import { useState, useEffect, useRef } from "react";

interface Level08Props {
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

export function Level08Wait({ params, onSubmit }: Level08Props) {
  const durationMs = (params.durationMs as number) ?? 15000;
  const [lit, setLit] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const startRef = useRef<number>(0);
  useEffect(() => {
    startRef.current = Date.now();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (clickCount > 0) return;
      const ms = Date.now() - startRef.current;
      setElapsed(ms);
      if (ms >= durationMs && !done) {
        setDone(true);
        onSubmit({ waitedMs: ms, clickCount: 0 }).then((r) => {
          if (r.success) setMessage("La llama permanece.");
          else setMessage(r.message ?? "");
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [clickCount, durationMs, done, onSubmit]);

  function handleClick() {
    setClickCount((c) => c + 1);
    setLit(false);
    onSubmit({ waitedMs: elapsed, clickCount: clickCount + 1 }).then((r) => {
      if (!r.success) setMessage(r.message ?? "La llama se apaga.");
    });
  }

  const progress = Math.min(100, (elapsed / durationMs) * 100);

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={handleClick}
        className="relative h-24 w-12 cursor-pointer"
        aria-label="Vela"
      >
        <div className={`mx-auto h-8 w-2 rounded-full transition-opacity duration-500 ${lit ? "bg-[var(--accent-gold)] opacity-80" : "bg-[var(--text-faint)] opacity-20"}`} />
        <div className="mx-auto h-16 w-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]" />
      </button>
      <div className="w-48 h-px bg-[var(--border-subtle)]">
        <div className="h-px bg-[var(--accent-gold-dim)] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="terminal-text text-xs text-[var(--text-faint)]">
        {clickCount > 0 ? "Apagada." : "No toques."}
      </p>
      {message && <p className="narrative-text text-[var(--text-muted)]">{message}</p>}
    </div>
  );
}
