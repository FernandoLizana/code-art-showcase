import { config, validateFinalCoordinates } from "@/lib/config";
import { GameShell } from "@/components/layout/GameShell";

export default function FinalPage() {
  try {
    validateFinalCoordinates();
  } catch {
    return (
      <GameShell>
        <div className="flex flex-1 items-center justify-center">
          <p className="narrative-text text-[var(--accent-red)]">
            Configuración de destino final inválida.
          </p>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <div className="mx-auto max-w-lg px-6 py-12 fade-in text-center">
        <p className="narrative-text text-lg mb-8 text-[var(--text-muted)]">
          No encontraste este lugar.
          <br />
          Lo construiste durante cien decisiones.
          <br />
          <span className="text-[var(--text-faint)]">
            El mapa solo aprendió a parecerse a ti.
          </span>
        </p>
        <div className="panel-arcane terminal-text text-sm space-y-2 mb-8">
          <p>{config.FINAL_DESTINATION_LABEL}</p>
          <p className="text-[var(--accent-gold)]">{config.FINAL_SAFE_COORDINATES}</p>
        </div>
        <p className="terminal-text text-xs text-[var(--text-faint)]">
          Este destino es parte de una experiencia ficticia o autorizada.
        </p>
      </div>
    </GameShell>
  );
}
