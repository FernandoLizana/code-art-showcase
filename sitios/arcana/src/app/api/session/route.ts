import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createGameSession,
  getSessionFromCookies,
  setSessionCookie,
  recoverSession,
} from "@/lib/session";
import { buildPlayerContext } from "@/lib/game/context";
import { db } from "@/lib/db";

export async function GET() {
  const existing = await getSessionFromCookies();
  if (existing) {
    const context = await buildPlayerContext(existing.sessionId, existing.seed);
    const session = await db.gameSession.findUnique({
      where: { id: existing.sessionId },
    });
    return NextResponse.json({
      sessionId: existing.sessionId,
      hasPersonality: !!context?.personality,
      currentLevel: context?.currentLevel ?? 0,
      recoveryCode: session?.recoveryCode,
    });
  }
  return NextResponse.json({ session: null });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const schema = z.object({
    action: z.enum(["create", "recover"]),
    recoveryCode: z.string().optional(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  if (parsed.data.action === "recover" && parsed.data.recoveryCode) {
    const token = await recoverSession(parsed.data.recoveryCode);
    if (!token) {
      return NextResponse.json({ error: "Código no encontrado" }, { status: 404 });
    }
    await setSessionCookie(token);
    return NextResponse.json({ success: true });
  }

  const session = await createGameSession();
  await setSessionCookie(session.token);
  return NextResponse.json({
    sessionId: session.sessionId,
    recoveryCode: session.recoveryCode,
  });
}
