import Link from "next/link";
import { GameShell } from "@/components/layout/GameShell";

export default function HomePage() {
  return (
    <GameShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 fade-in">
        <div className="max-w-md text-center">
          <p className="narrative-text mb-8 text-lg leading-relaxed text-[var(--text-muted)]">
            Este archivo no fue construido para ti.
            <br />
            <span className="text-[var(--text-faint)]">Sin embargo, ya respondió.</span>
          </p>
          <Link
            href="/advertencia"
            className="btn-arcane inline-block opacity-40 hover:opacity-100 transition-opacity duration-[2s]"
          >
            Entrar
          </Link>
        </div>
      </div>
    </GameShell>
  );
}
