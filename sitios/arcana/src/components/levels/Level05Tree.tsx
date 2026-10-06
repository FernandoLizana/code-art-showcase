"use client";

import { useState, useRef } from "react";
import { SEFIROT, VALID_TREE_CONNECTIONS } from "@/lib/tarot/constants";

interface Level05Props {
  params: Record<string, unknown>;
  onSubmit: (payload: unknown) => Promise<{ success: boolean; message?: string }>;
}

const TREE_POS: Record<string, { x: number; y: number }> = {
  keter: { x: 200, y: 40 },
  jojma: { x: 120, y: 100 },
  bina: { x: 280, y: 100 },
  jesed: { x: 80, y: 200 },
  guevura: { x: 320, y: 200 },
  tiferet: { x: 200, y: 200 },
  netzaj: { x: 120, y: 300 },
  hod: { x: 280, y: 300 },
  yesod: { x: 200, y: 360 },
  maljut: { x: 200, y: 420 },
};

export function Level05Tree({ onSubmit }: Level05Props) {
  const [placed, setPlaced] = useState<Set<string>>(new Set(["keter"]));
  const [connections, setConnections] = useState<[string, string][]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  const availableSefirot = SEFIROT.filter((s) => !placed.has(s.id));

  function placeSefira(id: string) {
    setPlaced((prev) => new Set([...prev, id]));
  }

  function handleNodeClick(id: string) {
    if (dragging) {
      if (dragging !== id) {
        const conn: [string, string] = [dragging, id];
        const key = [dragging, id].sort().join(":");
        const validKeys = new Set(
          VALID_TREE_CONNECTIONS.map(([a, b]) => [a, b].sort().join(":")),
        );
        if (validKeys.has(key)) {
          setConnections((prev) => {
            if (prev.some(([a, b]) => [a, b].sort().join(":") === key)) return prev;
            const next = [...prev, conn];
            // Auto-place connected sefirot
            setPlaced((p) => new Set([...p, dragging, id]));
            return next;
          });
        } else {
          setMessage("Ese sendero no existe.");
        }
      }
      setDragging(null);
    } else {
      setDragging(id);
    }
  }

  async function handleSubmit() {
    const result = await onSubmit({
      connections,
      placedSefirot: [...placed],
    });
    if (result.success) {
      setMessage("El árbol florece.");
    } else {
      setMessage(result.message ?? "El árbol está incompleto.");
    }
  }

  return (
    <div className="flex flex-col items-center">
      <p className="terminal-text text-xs text-[var(--text-faint)] mb-4">
        Clic en esfera para seleccionar, clic en otra para conectar. Kéter ya existe.
      </p>

      <svg ref={svgRef} viewBox="0 0 400 450" className="w-full max-w-md h-96 mb-4">
        {connections.map(([a, b], i) => {
          const pa = TREE_POS[a];
          const pb = TREE_POS[b];
          if (!pa || !pb) return null;
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke="var(--accent-gold-dim)"
              strokeWidth="1"
            />
          );
        })}
        {SEFIROT.filter((s) => placed.has(s.id)).map((s) => {
          const pos = TREE_POS[s.id];
          return (
            <g key={s.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="18"
                fill="var(--bg-elevated)"
                stroke={dragging === s.id ? "var(--accent-gold)" : "var(--text-faint)"}
                strokeWidth="1"
                className="cursor-pointer"
                onClick={() => handleNodeClick(s.id)}
              />
              <text
                x={pos.x}
                y={pos.y + 4}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="8"
                className="pointer-events-none"
              >
                {s.name}
              </text>
            </g>
          );
        })}
      </svg>

      {availableSefirot.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {availableSefirot.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => placeSefira(s.id)}
              className="btn-arcane text-xs"
            >
              + {s.name}
            </button>
          ))}
        </div>
      )}

      <button type="button" onClick={handleSubmit} className="btn-arcane">
        Completar árbol
      </button>

      {message && <p className="narrative-text mt-4 text-[var(--text-muted)]">{message}</p>}
    </div>
  );
}
