import { GameShell } from "@/components/layout/GameShell";

export default function ArchivoPage() {
  return (
    <GameShell showNav>
      <div className="mx-auto max-w-2xl px-6 py-12 fade-in">
        <h1 className="narrative-text text-2xl mb-6">Archivo</h1>
        <div className="panel-arcane terminal-text text-sm space-y-4 text-[var(--text-muted)]">
          <p>[ REGISTRO CORRUPTO — FRAGMENTO 0x07 ]</p>
          <p>Participante desconocido escribió:</p>
          <p className="italic text-[var(--text-faint)]">
            &quot;La puerta sin nombre no tiene nombre porque aún no ha sido cruzada.&quot;
          </p>
          <p className="text-[var(--text-faint)]">— fecha ilegible</p>
        </div>
      </div>
    </GameShell>
  );
}
