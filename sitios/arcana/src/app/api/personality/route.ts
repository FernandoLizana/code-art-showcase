import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromCookies } from "@/lib/session";
import { updateSessionProgress } from "@/lib/game/context";
import { buildPersonalityProfile, selectQuestions } from "@/lib/personality/scoring";

const answerSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      optionIndex: z.number().min(0),
    }),
  ),
});

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }

  const questions = selectQuestions(session.seed);
  return NextResponse.json({
    questions: questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options.map((o) => ({ text: o.text })),
    })),
    total: questions.length,
  });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Respuestas inválidas" }, { status: 400 });
  }

  const profile = buildPersonalityProfile(session.seed, parsed.data.answers);
  await updateSessionProgress(session.sessionId, {
    personality: profile,
    currentLevel: 1,
    words: [profile.borrowedName],
    narrative: { borrowedName: profile.borrowedName, thresholdChoice: null },
  });

  return NextResponse.json({
    profile: {
      primaryArchetype: profile.primaryArchetype,
      secondaryArchetype: profile.secondaryArchetype,
      dominantDimension: profile.dominantDimension,
      avoidedDimension: profile.avoidedDimension,
      tarotCard: profile.tarotCard,
      borrowedName: profile.borrowedName,
    },
  });
}
