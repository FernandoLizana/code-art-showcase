import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { getSessionFromCookies } from "@/lib/session";
import { buildPlayerContext } from "@/lib/game/context";

/** Reveals final coordinates only after level 99 confirmation */
export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
  }

  const context = await buildPlayerContext(session.sessionId, session.seed);
  if (!context) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  const confirmed = context.narrative.final_confirmed === true;
  const completed99 = context.completedLevels.includes(99);

  if (!confirmed && !completed99) {
    return NextResponse.json(
      { error: "Confirma en el nivel 99 antes de ver el destino." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    label: config.FINAL_DESTINATION_LABEL,
    coordinates: config.FINAL_SAFE_COORDINATES,
  });
}
