import Link from "next/link";
import { GameShell } from "@/components/layout/GameShell";

export default function UmbralPage() {
  return (
    <GameShell showNav>
      <div className="flex flex-1 flex-col items-center justify-center px-6 fade-in">
        <div className="max-w-md text-center">
          <p className="narrative-text mb-4 text-[var(--text-muted)]">
            Has cruzado el umbral.
          </p>
          <p className="terminal-text mb-8 text-xs text-[var(--text-faint)]">
            Lo que sigue no tiene mapa.
          </p>
          <Link href="/nivel/1" className="btn-arcane inline-block">
            Abrir la primera puerta
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
