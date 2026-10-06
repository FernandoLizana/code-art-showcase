"use client";

import { useEffect, useState } from "react";
import { GameShell } from "@/components/layout/GameShell";

interface Entry {
  id: string;
  category: string;
  title: string | null;
  content: string;
}

export default function CuadernoPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/cuaderno").then((r) => r.json()).then((d) => setEntries(d.entries ?? []));
  }, []);

  async function saveNote() {
    if (!content.trim()) return;
    const res = await fetch("/api/cuaderno", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category: "note" }),
    });
    if (res.ok) {
      const entry = await res.json();
      setEntries((prev) => [entry, ...prev]);
      setContent("");
    }
  }

  return (
    <GameShell showNav>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="narrative-text text-2xl mb-6">Cuaderno</h1>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input-arcane h-32 mb-4 resize-none"
          placeholder="Escribe lo que no debes olvidar..."
          aria-label="Nueva nota"
        />
        <button type="button" onClick={saveNote} className="btn-arcane mb-8">
          Guardar
        </button>
        <div className="space-y-4">
          {entries.map((e) => (
            <div key={e.id} className="panel-arcane">
              <p className="narrative-text text-[var(--text-muted)] whitespace-pre-wrap">{e.content}</p>
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
