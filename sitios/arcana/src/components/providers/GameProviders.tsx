"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AudioContextValue {
  enabled: boolean;
  volume: number;
  enable: () => void;
  disable: () => void;
  setVolume: (v: number) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function GameProviders({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.3);

  const enable = useCallback(() => setEnabled(true), []);
  const disable = useCallback(() => setEnabled(false), []);
  const setVolume = useCallback((v: number) => setVolumeState(Math.max(0, Math.min(1, v))), []);

  return (
    <AudioContext.Provider value={{ enabled, volume, enable, disable, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within GameProviders");
  return ctx;
}
