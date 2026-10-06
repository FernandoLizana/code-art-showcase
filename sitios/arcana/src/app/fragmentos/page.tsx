import { GameShell } from "@/components/layout/GameShell";

export default function FragmentosPage() {
  return (
    <GameShell showNav>
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="narrative-text text-2xl mb-6">Fragmentos</h1>
        <p className="narrative-text text-[var(--text-faint)]">
          Aún no has reunido fragmentos suficientes.
        </p>
      </div>
    </GameShell>
  );
}
