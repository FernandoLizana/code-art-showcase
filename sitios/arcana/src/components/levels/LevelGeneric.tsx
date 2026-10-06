"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { LevelRendererProps } from "./LevelRenderer";

type Opt = { id: string; label: string };

export function LevelGeneric({ levelId, params, onSubmit }: LevelRendererProps) {
  const uiType = (params.uiType as string) ?? "text";
  const [message, setMessage] = useState("");

  const submit = useCallback(
    async (payload: unknown) => {
      const r = await onSubmit(payload);
      setMessage(r.success ? "Umbral cruzado." : (r.message ?? "Incorrecto."));
      return r;
    },
    [onSubmit],
  );

  switch (uiType) {
    case "text":
    case "inverted_text":
    case "rejected_answer":
    case "spaced_text":
    case "strikethrough":
    case "redacted_text":
      return (
        <TextLevel
          params={params}
          uiType={uiType}
          onSubmit={submit}
          message={message}
          inverted={uiType === "inverted_text"}
        />
      );
    case "choice":
    case "between_choice":
    case "void_choice":
    case "intuitive_pick":
    case "card_orientation":
    case "possession":
      return <ChoiceLevel params={params} uiType={uiType} onSubmit={submit} message={message} />;
    case "cards":
      return <CardsLevel params={params} onSubmit={submit} message={message} />;
    case "order":
    case "ritual":
    case "timeline":
    case "testimonies":
      return <OrderLevel params={params} onSubmit={submit} message={message} />;
    case "memory_cards":
      return <MemoryCardsLevel params={params} onSubmit={submit} message={message} />;
    case "shadow_select":
      return <ShadowLevel params={params} onSubmit={submit} message={message} />;
    case "promise":
      return <PromiseLevel onSubmit={submit} message={message} />;
    case "pulses":
      return <PulsesLevel params={params} onSubmit={submit} message={message} />;
    case "red_button":
      return <RedButtonLevel onSubmit={submit} message={message} />;
    case "wait":
    case "silence":
      return <WaitLevel params={params} onSubmit={submit} message={message} />;
    case "fool_walk":
      return <FoolWalkLevel params={params} onSubmit={submit} message={message} />;
    case "balance_forces":
      return <BalanceForcesLevel onSubmit={submit} message={message} />;
    case "gentle_touch":
      return <GentleTouchLevel params={params} onSubmit={submit} message={message} />;
    case "lamp":
      return <LampLevel params={params} onSubmit={submit} message={message} />;
    case "wheel":
      return <WheelLevel params={params} onSubmit={submit} message={message} />;
    case "eliminate":
      return <EliminateLevel params={params} onSubmit={submit} message={message} />;
    case "distribute":
      return <DistributeLevel params={params} onSubmit={submit} message={message} />;
    case "memory_select":
      return <MemorySelectLevel params={params} onSubmit={submit} message={message} />;
    case "align":
      return <AlignLevel params={params} onSubmit={submit} message={message} />;
    case "archive_link":
    case "hidden_access":
      return <ArchiveAccessLevel levelId={levelId} uiType={uiType} onSubmit={submit} message={message} />;
    case "offset_click":
      return <OffsetClickLevel params={params} onSubmit={submit} message={message} />;
    case "window_approach":
      return <WindowLevel params={params} onSubmit={submit} message={message} levelId={levelId} />;
    case "archive_record":
    case "witness_conflict":
      return <DocumentLevel params={params} onSubmit={submit} message={message} />;
    case "missing_ui":
    case "negative_space":
    case "unlabeled":
      return <HiddenClickLevel params={params} onSubmit={submit} message={message} />;
    case "blank_page":
      return <BlankPageLevel onSubmit={submit} message={message} />;
    case "empty_inventory":
    case "minimal":
      return <EmptyActionLevel action="close" onSubmit={submit} message={message} />;
    case "empty_submit":
      return <EmptyActionLevel action="empty" onSubmit={submit} message={message} />;
    case "judgment_scale":
      return <JudgmentLevel params={params} onSubmit={submit} message={message} />;
    case "path_fragments":
    case "map_partial":
      return <MapLevel params={params} onSubmit={submit} message={message} />;
    case "arrival_ritual":
      return <RitualStepsLevel params={params} onSubmit={submit} message={message} />;
    case "confirmation":
      return <ConfirmationLevel onSubmit={submit} message={message} />;
    case "final_destination":
      return <FinalDestinationLevel onSubmit={submit} message={message} />;
    case "tree_decisions":
      return <TreeDecisionsLevel params={params} onSubmit={submit} message={message} />;
    default:
      return (
        <GenericFallback
          params={params}
          onSubmit={submit}
          message={message}
          uiType={uiType}
        />
      );
  }
}

function Message({ text }: { text: string }) {
  if (!text) return null;
  return <p className="narrative-text mt-4 text-[var(--text-muted)]">{text}</p>;
}

function TextLevel({
  params,
  uiType,
  onSubmit,
  message,
  inverted,
}: {
  params: Record<string, unknown>;
  uiType: string;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
  inverted?: boolean;
}) {
  const [answer, setAnswer] = useState("");
  const displayText = params.displayText as string | undefined;
  const content = params.content as string | undefined;
  const symbols = params.symbols as string[] | undefined;
  const placeholder = (params.placeholder as string) ?? "Escribe aquí...";

  useEffect(() => {
    if (symbols?.length) {
      let i = 0;
      const el = document.getElementById("pillar-symbols");
      if (!el) return;
      const interval = setInterval(() => {
        if (i < symbols.length) {
          el.textContent = (el.textContent ?? "") + " " + symbols[i];
          i++;
        } else clearInterval(interval);
      }, (params.paceMs as number) ?? 1500);
      return () => clearInterval(interval);
    }
  }, [symbols, params.paceMs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({ answer });
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${inverted ? "rotate-180" : ""}`}>
      {displayText && <p className="terminal-text text-lg">{displayText}</p>}
      {content && <div className="panel-arcane max-w-md narrative-text text-sm whitespace-pre-wrap">{content}</div>}
      {uiType === "spaced_text" && typeof params.spacedDisplay === "string" && (
        <p className="terminal-text tracking-[0.5em]">{params.spacedDisplay}</p>
      )}
      {symbols && <p id="pillar-symbols" className="terminal-text text-2xl tracking-widest min-h-8" />}
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="input-arcane flex-1"
          placeholder={placeholder}
          aria-label="Respuesta"
        />
        <button type="submit" className="btn-arcane">Enviar</button>
      </form>
      <Message text={message} />
    </div>
  );
}

function ChoiceLevel({
  params,
  uiType,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  uiType: string;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const options = (params.options as Opt[]) ?? [];
  const presentElements = params.presentElements as string[] | undefined;

  async function pick(id: string, extra?: Record<string, unknown>) {
    await onSubmit({ choice: id, ...extra });
  }

  if (uiType === "between_choice" && options.length >= 2) {
    return (
      <div className="flex items-center gap-4">
        <button type="button" className="btn-arcane" onClick={() => pick(options[0].id)}>{options[0].label}</button>
        <button
          type="button"
          className="panel-arcane px-4 py-2 text-xs terminal-text cursor-pointer hover:border-[var(--accent-gold)]"
          onClick={() => pick("entre", { selected: "between" })}
        >
          ···
        </button>
        <button type="button" className="btn-arcane" onClick={() => pick(options[1].id)}>{options[1].label}</button>
        <Message text={message} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {presentElements && (
        <p className="terminal-text text-xs">Presentes: {presentElements.join(", ")}</p>
      )}
      <div className="grid grid-cols-2 gap-2 max-w-md">
        {options.map((o) => (
          <button key={o.id} type="button" className="btn-arcane text-sm" onClick={() => pick(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
      <Message text={message} />
    </div>
  );
}

function CardsLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const cards = (params.cards as { id: number; name: string }[]) ?? [];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {cards.map((c) => (
        <button
          key={c.id}
          type="button"
          className="panel-arcane p-2 text-xs cursor-pointer hover:border-[var(--accent-gold-dim)]"
          onClick={() => onSubmit({ cardId: c.id })}
        >
          {c.name}
        </button>
      ))}
      <Message text={message} />
    </div>
  );
}

function OrderLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const items = (params.items as { id: number | string; label: string }[]) ?? [];
  const [order, setOrder] = useState<(number | string)[]>(items.map((i) => i.id));

  function move(idx: number, dir: -1 | 1) {
    const next = [...order];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setOrder(next);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {order.map((id, idx) => {
        const item = items.find((i) => i.id === id);
        return (
          <div key={String(id)} className="flex items-center gap-2 w-full max-w-sm">
            <button type="button" className="btn-arcane text-xs" onClick={() => move(idx, -1)} aria-label="Subir">↑</button>
            <span className="panel-arcane flex-1 p-2 text-sm">{item?.label ?? id}</span>
            <button type="button" className="btn-arcane text-xs" onClick={() => move(idx, 1)} aria-label="Bajar">↓</button>
          </div>
        );
      })}
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ order })}>Confirmar orden</button>
      <Message text={message} />
    </div>
  );
}

function MemoryCardsLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const cards = (params.cards as { id: number; name: string; color: string; position: number }[]) ?? [];
  const showDurationMs = (params.showDurationMs as number) ?? 5000;
  const [phase, setPhase] = useState<"show" | "quiz">("show");
  const [order, setOrder] = useState<number[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setPhase("quiz"), showDurationMs);
    return () => clearTimeout(t);
  }, [showDurationMs]);

  if (phase === "show") {
    return (
      <div className="flex gap-2 flex-wrap justify-center">
        {cards.map((c) => (
          <div key={c.id} className="panel-arcane p-3 w-24 text-center text-xs">
            <span className="block narrative-text">{c.name}</span>
            <span className="terminal-text text-[10px] text-[var(--text-faint)]">{c.color}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="terminal-text text-xs">Reconstruye el orden (clic para añadir)</p>
      <div className="flex flex-wrap gap-2">
        {cards.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={order.includes(c.id)}
            className="btn-arcane text-xs disabled:opacity-30"
            onClick={() => setOrder((p) => [...p, c.id])}
          >
            {c.name}
          </button>
        ))}
      </div>
      <p className="terminal-text text-xs">Orden: {order.join(" → ")}</p>
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ order, centerPosition: 2 })}>
        Enviar
      </button>
      <Message text={message} />
    </div>
  );
}

function ShadowLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const faces = (params.faces as { id: number; label: string }[]) ?? [];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="grid grid-cols-3 gap-3">
      {faces.map((f) => (
        <button
          key={f.id}
          type="button"
          className="panel-arcane h-20 cursor-pointer hover:border-[var(--accent-gold-dim)]"
          style={{ opacity: f.id === tick % faces.length ? 0.5 : 1 }}
          onClick={() => onSubmit({ selectedId: f.id })}
        >
          {f.label}
        </button>
      ))}
      <Message text={message} />
    </div>
  );
}

function PromiseLevel({
  onSubmit,
  message,
}: {
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  return (
    <div className="flex gap-4">
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ action: "keep" })}>Prometo no abrir</button>
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ action: "break" })}>Abrir de todos modos</button>
      <Message text={message} />
    </div>
  );
}

function PulsesLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const pattern = (params.pattern as number[]) ?? [1, 1, 2, 1, 3, 1];
  const [selected, setSelected] = useState<number[]>([]);
  function toggle(i: number) {
    setSelected((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-1 items-end h-24">
        {pattern.map((h, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`w-6 transition-colors ${selected.includes(i) ? "bg-[var(--accent-gold)]" : "bg-[var(--text-faint)]"}`}
            style={{ height: `${h * 24}px` }}
            aria-label={`Pulso ${i + 1}`}
          />
        ))}
      </div>
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ indices: selected.sort() })}>
        Enviar anomalías
      </button>
      <Message text={message} />
    </div>
  );
}

function RedButtonLevel({
  onSubmit,
  message,
}: {
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        className="h-16 w-32 rounded bg-[var(--accent-red)] text-[var(--text-primary)] cursor-pointer hover:opacity-80"
        onClick={() => onSubmit({ action: "press" })}
      >
        NO PRESionar
      </button>
      <button type="button" className="btn-arcane text-xs" onClick={() => onSubmit({ action: "ignore" })}>
        Ignorar botón
      </button>
      <Message text={message} />
    </div>
  );
}

function WaitLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const durationMs = (params.durationMs as number) ?? 8000;
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(0);
  useEffect(() => {
    start.current = Date.now();
    const i = setInterval(() => {
      const ms = Date.now() - start.current;
      setElapsed(ms);
      if (ms >= durationMs) onSubmit({ waitedMs: ms, clickCount: 0 });
    }, 400);
    return () => clearInterval(i);
  }, [durationMs, onSubmit]);
  return (
    <div className="text-center">
      <p className="terminal-text text-xs text-[var(--text-faint)]">Permanece en silencio...</p>
      <div className="w-48 h-px bg-[var(--border-subtle)] mx-auto mt-4">
        <div className="h-px bg-[var(--accent-gold-dim)]" style={{ width: `${Math.min(100, (elapsed / durationMs) * 100)}%` }} />
      </div>
      <Message text={message} />
    </div>
  );
}

function FoolWalkLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const steps = (params.steps as number) ?? 5;
  const [pos, setPos] = useState(50);
  const [moves, setMoves] = useState(0);
  function onMouseMove(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setPos(100 - x);
    if (moves < steps) setMoves((m) => m + 1);
  }
  return (
    <div
      className="relative h-24 w-full max-w-md border border-[var(--border-subtle)] cursor-crosshair"
      onMouseMove={onMouseMove}
    >
      <div className="absolute top-1/2 -translate-y-1/2 text-lg transition-all" style={{ left: `${pos}%` }}>
        🃏
      </div>
      <button
        type="button"
        className="btn-arcane absolute bottom-2 right-2 text-xs"
        onClick={() => onSubmit({ direction: "backward", stepsCompleted: moves })}
      >
        Reportar dirección
      </button>
      <Message text={message} />
    </div>
  );
}

function BalanceForcesLevel({
  onSubmit,
  message,
}: {
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const [val, setVal] = useState(50);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
      <input type="range" min="0" max="100" value={val} onChange={(e) => setVal(+e.target.value)} className="w-full" />
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ balance: val, left: 100 - val, right: val })}>
        Equilibrar fuerzas
      </button>
      <Message text={message} />
    </div>
  );
}

function GentleTouchLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const holdMs = (params.holdMs as number) ?? 3000;
  const [held, setHeld] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  function startHold() {
    const start = Date.now();
    timer.current = setInterval(() => {
      const ms = Date.now() - start;
      setHeld(ms);
      if (ms >= holdMs) {
        if (timer.current) clearInterval(timer.current);
        onSubmit({ heldMs: ms, gentle: true });
      }
    }, 100);
  }
  function stopHold() {
    if (timer.current) clearInterval(timer.current);
    onSubmit({ heldMs: held, gentle: false });
  }
  return (
    <button
      type="button"
      className="panel-arcane px-8 py-6 cursor-pointer select-none"
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
    >
      Mantén presionado suavemente
      <Message text={message} />
    </button>
  );
}

function LampLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const hiddenText = (params.hiddenText as string) ?? "luz";
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [found, setFound] = useState(false);
  const target = (params.targetZone as { x: number; y: number }) ?? { x: 70, y: 30 };
  function move(e: React.MouseEvent) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    const dx = Math.abs(pos.x - target.x);
    const dy = Math.abs(pos.y - target.y);
    if (dx < 15 && dy < 15) setFound(true);
  }
  return (
    <div className="relative h-64 w-full max-w-md bg-black overflow-hidden" onMouseMove={move}>
      <div
        className="pointer-events-none absolute rounded-full bg-white/10 blur-xl"
        style={{ width: 80, height: 80, left: `calc(${pos.x}% - 40px)`, top: `calc(${pos.y}% - 40px)` }}
      />
      {found && <p className="absolute text-[var(--text-faint)] opacity-30" style={{ left: `${target.x}%`, top: `${target.y}%` }}>{hiddenText}</p>}
      <button type="button" className="btn-arcane absolute bottom-2 right-2 text-xs" onClick={() => onSubmit({ answer: hiddenText, found })}>
        Enviar
      </button>
      <Message text={message} />
    </div>
  );
}

function WheelLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const symbols = (params.symbols as string[]) ?? ["☉", "☽", "△"];
  const [rotation, setRotation] = useState(0);
  function spin() {
    setRotation((r) => r + 60 + Math.random() * 120);
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-4xl transition-transform duration-500" style={{ transform: `rotate(${rotation}deg)` }}>
        {symbols[Math.floor(rotation / 60) % symbols.length]}
      </div>
      <button type="button" className="btn-arcane" onClick={spin}>Girar</button>
      <button type="button" className="btn-arcane text-xs" onClick={() => onSubmit({ stopped: true, symbolIndex: Math.floor(rotation / 60) % symbols.length })}>
        Detener
      </button>
      <Message text={message} />
    </div>
  );
}

function EliminateLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const items = (params.items as Opt[]) ?? [];
  const [remaining, setRemaining] = useState(items.map((i) => i.id));
  function eliminate(id: string) {
    setRemaining((p) => p.filter((x) => x !== id));
  }
  return (
    <div className="flex flex-col gap-2">
      {items.filter((i) => remaining.includes(i.id)).map((i) => (
        <button key={i.id} type="button" className="btn-arcane text-sm" onClick={() => eliminate(i.id)}>{i.label} ✕</button>
      ))}
      <button type="button" className="btn-arcane mt-4" onClick={() => onSubmit({ eliminated: items.filter((i) => !remaining.includes(i.id)).map((i) => i.id), remaining })}>
        Confirmar
      </button>
      <Message text={message} />
    </div>
  );
}

function DistributeLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const figures = (params.figures as Opt[]) ?? [];
  const total = (params.totalResources as number) ?? 6;
  const [alloc, setAlloc] = useState<Record<string, number>>({});
  function add(id: string) {
    const used = Object.values(alloc).reduce((a, b) => a + b, 0);
    if (used >= total) return;
    setAlloc((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
  }
  return (
    <div className="flex flex-col gap-2">
      {figures.map((f) => (
        <button key={f.id} type="button" className="btn-arcane text-sm" onClick={() => add(f.id)}>
          {f.label} ({alloc[f.id] ?? 0})
        </button>
      ))}
      <button type="button" className="btn-arcane mt-2" onClick={() => onSubmit({ allocation: alloc })}>Distribuir</button>
      <Message text={message} />
    </div>
  );
}

function MemorySelectLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const memories = (params.memories as { id: string; label: string }[]) ?? [];
  const [sel, setSel] = useState<string[]>([]);
  function toggle(id: string) {
    setSel((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {memories.map((m) => (
        <button key={m.id} type="button" className={`panel-arcane p-2 text-xs ${sel.includes(m.id) ? "border-[var(--accent-gold)]" : ""}`} onClick={() => toggle(m.id)}>
          {m.label}
        </button>
      ))}
      <button type="button" className="btn-arcane col-span-2" onClick={() => onSubmit({ selected: sel })}>Confirmar recuerdos</button>
      <Message text={message} />
    </div>
  );
}

function AlignLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const [offset, setOffset] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-32 w-48 border border-[var(--border-subtle)]">
        <div className="absolute inset-4 border border-dashed border-[var(--text-faint)]" style={{ transform: `translateX(${offset}px)` }} />
        <div className="absolute inset-4 border border-[var(--accent-gold-dim)]" />
      </div>
      <input type="range" min="-40" max="40" value={offset} onChange={(e) => setOffset(+e.target.value)} className="w-48" />
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ offset })}>Alinear</button>
      <Message text={message} />
    </div>
  );
}

function ArchiveAccessLevel({
  levelId,
  uiType,
  onSubmit,
  message,
}: {
  levelId: number;
  uiType: string;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="terminal-text text-sm text-[var(--text-faint)]">
        {uiType === "hidden_access" ? "Este nivel no aparece en Continuar." : "Busca en el archivo."}
      </p>
      <Link href="/archivo" className="btn-arcane">Ir al archivo</Link>
      <button type="button" className="btn-arcane text-xs" onClick={() => onSubmit({ fromArchive: true, levelId })}>
        Acceder desde archivo
      </button>
      <Message text={message} />
    </div>
  );
}

function OffsetClickLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const offsetX = (params.offsetX as number) ?? 40;
  const [real, setReal] = useState({ x: 0, y: 0 });
  return (
    <div
      className="relative h-48 w-full max-w-md border border-[var(--border-subtle)]"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setReal({ x: e.clientX - r.left, y: e.clientY - r.top });
        onSubmit({ x: e.clientX - r.left - offsetX, y: e.clientY - r.top, usedKeyboard: false });
      }}
    >
      <p className="terminal-text text-xs p-2">Clic desplazado. Usa teclado: flechas + Enter en zona oculta.</p>
      <button
        type="button"
        className="btn-arcane absolute text-xs"
        style={{ left: (params.targetX as number) ?? 200, top: (params.targetY as number) ?? 80 }}
        onClick={() => onSubmit({ x: params.targetX, y: params.targetY, usedKeyboard: true })}
      >
        ●
      </button>
      <Message text={message} />
    </div>
  );
}

function WindowLevel({
  params,
  onSubmit,
  message,
  levelId,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
  levelId: number;
}) {
  const [approach, setApproach] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-32 w-24 border border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50" style={{ opacity: 1 - approach / 100 }} />
      </div>
      <button type="button" className="btn-arcane text-xs" onClick={() => { setApproach((a) => a + 20); onSubmit({ hintsOpened: approach + 20, levelId }); }}>
        Abrir pista (+ acercamiento)
      </button>
      <Message text={message} />
    </div>
  );
}

function DocumentLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const record = (params.record as string) ?? (params.document as string) ?? "";
  const [answer, setAnswer] = useState("");
  return (
    <div className="max-w-md">
      <div className="panel-arcane terminal-text text-xs whitespace-pre-wrap mb-4 max-h-48 overflow-y-auto">{record}</div>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ answer }); }} className="flex gap-2">
        <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} className="input-arcane flex-1" />
        <button type="submit" className="btn-arcane">Enviar</button>
      </form>
      <Message text={message} />
    </div>
  );
}

function HiddenClickLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const zone = (params.clickZone as { x: number; y: number; w: number; h: number }) ?? { x: 45, y: 45, w: 10, h: 10 };
  return (
    <div
      className="relative h-64 w-full max-w-md bg-[var(--bg-secondary)]"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        onSubmit({ x, y, inZone: x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h });
      }}
    >
      <p className="terminal-text text-xs text-[var(--text-faint)] p-4">Lo que falta también responde.</p>
      <Message text={message} />
    </div>
  );
}

function BlankPageLevel({
  onSubmit,
  message,
}: {
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="h-48 w-32 mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-inner transition-shadow"
      style={{ boxShadow: hover ? "inset 0 -8px 12px rgba(255,255,255,0.05)" : undefined }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSubmit({ inspected: true, hover })}
    >
      <Message text={message} />
    </div>
  );
}

function EmptyActionLevel({
  action,
  onSubmit,
  message,
}: {
  action: "close" | "empty";
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      {action === "close" ? (
        <button type="button" className="btn-arcane" onClick={() => onSubmit({ action: "close_empty" })}>Cerrar lo vacío</button>
      ) : (
        <button type="button" className="btn-arcane" onClick={() => onSubmit({ action: "submit_empty", answer: "" })}>Enviar vacío</button>
      )}
      <Message text={message} />
    </div>
  );
}

function JudgmentLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const decisions = (params.decisions as Opt[]) ?? [];
  const [order, setOrder] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-2 max-w-md">
      {decisions.map((d) => (
        <button key={d.id} type="button" disabled={order.includes(d.id)} className="btn-arcane text-sm disabled:opacity-40" onClick={() => setOrder((p) => [...p, d.id])}>
          {d.label}
        </button>
      ))}
      <button type="button" className="btn-arcane mt-2" onClick={() => onSubmit({ order })}>Juzgar</button>
      <Message text={message} />
    </div>
  );
}

function MapLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const fragments = (params.fragments as string[]) ?? ["I", "II", "III"];
  const [answer, setAnswer] = useState("");
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">{fragments.map((f, i) => <span key={i} className="panel-arcane px-3 py-2 text-sm">{f}</span>)}</div>
      <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} className="input-arcane w-56" placeholder="Combinar fragmentos..." />
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ answer, fragments })}>Enviar</button>
      <Message text={message} />
    </div>
  );
}

function RitualStepsLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const steps = (params.steps as Opt[]) ?? [];
  const [done, setDone] = useState<string[]>([]);
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {steps.map((s) => (
        <button key={s.id} type="button" className="btn-arcane text-xs" onClick={() => setDone((p) => [...p, s.id])}>{s.label}</button>
      ))}
      <button type="button" className="btn-arcane w-full mt-4" onClick={() => onSubmit({ stepsCompleted: done })}>Completar ritual</button>
      <Message text={message} />
    </div>
  );
}

function ConfirmationLevel({
  onSubmit,
  message,
}: {
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  return (
    <div className="panel-arcane max-w-md text-center">
      <p className="narrative-text mb-4 text-sm">La ubicación final es parte de una experiencia autorizada o ficticia. ¿Deseas verla?</p>
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ confirmed: true })}>Confirmo</button>
      <Message text={message} />
    </div>
  );
}

function FinalDestinationLevel({
  onSubmit,
  message,
}: {
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  const [dest, setDest] = useState<{ label: string; coordinates: string } | null>(null);
  useEffect(() => {
    fetch("/api/final/destino").then((r) => r.json()).then(setDest);
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 max-w-md text-center">
      {dest && (
        <>
          <p className="narrative-text text-lg">{dest.label}</p>
          <p className="terminal-text text-[var(--accent-gold)]">{dest.coordinates}</p>
          <button type="button" className="btn-arcane text-xs" onClick={() => navigator.clipboard.writeText(dest.coordinates)}>Copiar coordenadas</button>
        </>
      )}
      <button type="button" className="btn-arcane mt-4" onClick={() => onSubmit({ viewed: true, acknowledged: true })}>Aceptar el lugar</button>
      <Message text={message} />
    </div>
  );
}

function TreeDecisionsLevel({
  params,
  onSubmit,
  message,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
}) {
  return (
    <div className="text-center">
      <p className="terminal-text text-xs mb-4">Reconstruye el árbol integrando tus decisiones previas.</p>
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ treeComplete: true, usedDecisions: true })}>Completar árbol</button>
      <Message text={message} />
    </div>
  );
}

function GenericFallback({
  params,
  onSubmit,
  message,
  uiType,
}: {
  params: Record<string, unknown>;
  onSubmit: (p: unknown) => Promise<{ success: boolean; message?: string }>;
  message: string;
  uiType: string;
}) {
  const [answer, setAnswer] = useState("");
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="terminal-text text-xs text-[var(--text-faint)]">[{uiType}]</p>
      <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} className="input-arcane w-56" />
      <button type="button" className="btn-arcane" onClick={() => onSubmit({ answer })}>Enviar</button>
      <Message text={message} />
    </div>
  );
}
