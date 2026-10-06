"use client";

import { useEffect, useRef } from "react";
import { useAudio } from "@/components/providers/GameProviders";

export function AmbientAudio() {
  const { enabled, volume } = useAudio();
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    if (!enabled) {
      nodesRef.current.forEach((n) => {
        try { n.stop(); } catch { /* already stopped */ }
      });
      nodesRef.current = [];
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const hum = ctx.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 55;
    const humGain = ctx.createGain();
    humGain.gain.value = volume * 0.08;
    hum.connect(humGain);
    humGain.connect(ctx.destination);
    hum.start();

    const noise = ctx.createOscillator();
    noise.type = "triangle";
    noise.frequency.value = 110;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = volume * 0.02;
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();

    nodesRef.current = [hum, noise];

    return () => {
      nodesRef.current.forEach((n) => {
        try { n.stop(); } catch { /* */ }
      });
      ctx.close();
    };
  }, [enabled, volume]);

  return null;
}
