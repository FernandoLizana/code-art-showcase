import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromCookies } from "@/lib/session";
import { buildPlayerContext, canAccessLevel, updateSessionProgress } from "@/lib/game/context";
import { generateLevelVariant, getLevel, validateLevelSubmission } from "@/lib/levels/registry";
import { sanitizeVariantParams } from "@/lib/levels/base";
import { db } from "@/lib/db";
import { hashSubmission } from "@/lib/security/hash";
import { checkRateLimit } from "@/lib/security/rate-limit";

const submitSchema = z.object({
  type: z.string(),
  payload: z.unknown(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ numero: string }> },
) {
  const { numero } = await params;
  const levelId = parseInt(numero, 10);
  if (isNaN(levelId) || levelId < 1 || levelId > 100) {
    return NextResponse.json({ error: "Nivel inválido" }, { status: 400 });
  }

  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
  }

  const context = await buildPlayerContext(session.sessionId, session.seed);
  if (!context) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  if (!context.personality && levelId > 0) {
    return NextResponse.json({ error: "Completa la prueba primero" }, { status: 403 });
  }

  if (!canAccessLevel(context, levelId)) {
    return NextResponse.json({ error: "Nivel bloqueado" }, { status: 403 });
  }

  const level = getLevel(levelId);
  if (!level) {
    return NextResponse.json({ error: "Nivel no encontrado" }, { status: 404 });
  }

  const variant = generateLevelVariant(levelId, context);
  if (!variant) {
    return NextResponse.json({ error: "No se pudo generar variante" }, { status: 500 });
  }

  const progress = await db.levelProgress.findUnique({
    where: { sessionId_levelId: { sessionId: session.sessionId, levelId } },
  });

  const safeParams = sanitizeVariantParams(variant.params);

  return NextResponse.json({
    level: {
      id: level.id,
      title: level.title,
      act: level.act,
      mechanic: level.mechanic,
      narrativeEntry: variant.narrativeOverride ?? level.narrativeEntry,
      hintsAvailable: level.hints.length,
      hintsUsed: progress?.hintsUsed ?? 0,
      accessibility: level.accessibilityMode,
    },
    variant: {
      modifier: variant.modifier,
      params: safeParams,
    },
    completed: context.completedLevels.includes(levelId),
    attempts: progress?.attempts ?? 0,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ numero: string }> },
) {
  const { numero } = await params;
  const levelId = parseInt(numero, 10);
  if (isNaN(levelId) || levelId < 1 || levelId > 100) {
    return NextResponse.json({ error: "Nivel inválido" }, { status: 400 });
  }

  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 401 });
  }

  const rateCheck = checkRateLimit(`${session.sessionId}:${levelId}`);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429 },
    );
  }

  const context = await buildPlayerContext(session.sessionId, session.seed);
  if (!context || !context.personality) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  if (!canAccessLevel(context, levelId)) {
    return NextResponse.json({ error: "Nivel bloqueado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const variant = generateLevelVariant(levelId, context);
  if (!variant) {
    return NextResponse.json({ error: "Variante no encontrada" }, { status: 500 });
  }

  const result = validateLevelSubmission(levelId, parsed.data, context, variant);

  const submissionStr = JSON.stringify(parsed.data);
  await db.levelAttempt.create({
    data: {
      sessionId: session.sessionId,
      levelId,
      submissionHash: hashSubmission(submissionStr),
      success: result.success,
    },
  });

  const progress = await db.levelProgress.upsert({
    where: { sessionId_levelId: { sessionId: session.sessionId, levelId } },
    create: {
      sessionId: session.sessionId,
      levelId,
      attempts: 1,
      variantJson: JSON.stringify(variant),
      completed: result.success,
      completedAt: result.success ? new Date() : null,
    },
    update: {
      attempts: { increment: 1 },
      completed: result.success ? true : undefined,
      completedAt: result.success ? new Date() : undefined,
      variantJson: JSON.stringify(variant),
    },
  });

  if (result.success) {
    const completedLevels = [...new Set([...context.completedLevels, levelId])];
    const narrative = { ...context.narrative };
    const words = [...context.words];
    const levelVariants = { ...context.levelVariants, [levelId]: variant };

    if (result.consequences) {
      for (const c of result.consequences) {
        if (c.key === "words" && typeof c.value === "string") {
          words.push(c.value);
        }
        narrative[c.key] = c.value;
      }
    }

    await updateSessionProgress(session.sessionId, {
      currentLevel: Math.max(levelId + 1, context.currentLevel),
      completedLevels,
      narrative,
      words,
      levelVariants,
    });

    await db.gameSession.update({
      where: { id: session.sessionId },
      data: { totalAttempts: { increment: 1 } },
    });
  } else {
    await db.gameSession.update({
      where: { id: session.sessionId },
      data: { totalAttempts: { increment: 1 } },
    });
  }

  return NextResponse.json({
    success: result.success,
    message: result.message,
    attempts: progress.attempts + (result.success ? 0 : 0),
  });
}
