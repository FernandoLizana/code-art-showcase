import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { buildPlayerContext } from "@/lib/game/context";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }

  const context = await buildPlayerContext(session.sessionId, session.seed);
  if (!context?.personality) {
    return NextResponse.json({ error: "Sin perfil" }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      primaryArchetype: context.personality.primaryArchetype,
      secondaryArchetype: context.personality.secondaryArchetype,
      dominantDimension: context.personality.dominantDimension,
      avoidedDimension: context.personality.avoidedDimension,
      tarotCard: context.personality.tarotCard,
      borrowedName: context.personality.borrowedName,
    },
    recoveryCode: (
      await (await import("@/lib/db")).db.gameSession.findUnique({
        where: { id: session.sessionId },
      })
    )?.recoveryCode,
  });
}
