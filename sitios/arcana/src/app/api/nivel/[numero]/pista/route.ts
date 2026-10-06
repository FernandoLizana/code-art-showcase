import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromCookies } from "@/lib/session";
import { getLevel } from "@/lib/levels/registry";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ numero: string }> },
) {
  const { numero } = await params;
  const levelId = parseInt(numero, 10);
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }

  const body = await request.json();
  const schema = z.object({ hintId: z.number().min(1).max(3) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Pista inválida" }, { status: 400 });
  }

  const level = getLevel(levelId);
  if (!level) {
    return NextResponse.json({ error: "Nivel no encontrado" }, { status: 404 });
  }

  const hint = level.hints.find((h) => h.id === parsed.data.hintId);
  if (!hint) {
    return NextResponse.json({ error: "Pista no encontrada" }, { status: 404 });
  }

  const progress = await db.levelProgress.upsert({
    where: { sessionId_levelId: { sessionId: session.sessionId, levelId } },
    create: {
      sessionId: session.sessionId,
      levelId,
      hintsUsed: parsed.data.hintId,
    },
    update: {
      hintsUsed: { set: Math.max(parsed.data.hintId, 0) },
    },
  });

  await db.gameSession.update({
    where: { id: session.sessionId },
    data: { totalHintsUsed: { increment: 1 } },
  });

  return NextResponse.json({ text: hint.text, hintsUsed: progress.hintsUsed });
}
