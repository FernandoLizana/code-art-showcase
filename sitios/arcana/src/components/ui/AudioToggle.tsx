"use client";

import { useAudio } from "@/components/providers/GameProviders";

export function AudioToggle() {
  const { enabled, enable, disable, volume, setVolume } = useAudio();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {enabled && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 accent-[var(--accent-gold)]"
          aria-label="Volumen"
        />
      )}
      <button
        type="button"
        onClick={enabled ? disable : enable}
        className="btn-arcane text-xs"
        aria-label={enabled ? "Desactivar audio" : "Activar audio"}
      >
        {enabled ? "Silencio" : "Escuchar"}
      </button>
    </div>
  );
}
