"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GameShell } from "@/components/layout/GameShell";

interface Profile {
  primaryArchetype: string;
  secondaryArchetype: string;
  dominantDimension: string;
  avoidedDimension: string;
  tarotCard: string;
  borrowedName: string;
}

export default function ResultadoPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then(async (session) => {
        if (!session.hasPersonality) {
          router.push("/prueba");
          return;
        }
        const ctx = await fetch("/api/personality/result").then((r) => r.json());
        setProfile(ctx.profile);
      });
  }, [router]);

  if (!profile) {
    return (
      <GameShell>
        <div className="flex flex-1 items-center justify-center terminal-text">...</div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 fade-in">
        <div className="panel-arcane max-w-lg w-full">
          <p className="terminal-text mb-6 text-xs uppercase tracking-widest">
            Resultado
          </p>
          <div className="space-y-6 narrative-text">
            <div>
              <p className="text-[var(--text-faint)] text-sm mb-1">Arquetipo</p>
              <p className="text-xl text-glow">{profile.primaryArchetype}</p>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                Sombra: {profile.secondaryArchetype}
              </p>
            </div>
            <div>
              <p className="text-[var(--text-faint)] text-sm mb-1">Carta asignada</p>
              <p className="text-lg">{profile.tarotCard}</p>
            </div>
            <div>
              <p className="text-[var(--text-faint)] text-sm mb-1">Nombre prestado</p>
              <p className="terminal-text">{profile.borrowedName}</p>
              <p className="text-[var(--text-faint)] text-xs mt-2">
                Recuérdalo. No sabrás cuándo lo necesitarás.
              </p>
            </div>
          </div>
          <Link href="/umbral" className="btn-arcane inline-block mt-8">
            Continuar
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
