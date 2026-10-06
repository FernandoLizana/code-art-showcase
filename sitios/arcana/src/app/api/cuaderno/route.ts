import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromCookies } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });

  const entries = await db.notebookEntry.findMany({
    where: { sessionId: session.sessionId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });

  const schema = z.object({
    content: z.string().min(1).max(5000),
    category: z.string().default("note"),
    title: z.string().optional(),
  });
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const entry = await db.notebookEntry.create({
    data: {
      sessionId: session.sessionId,
      content: parsed.data.content,
      category: parsed.data.category,
      title: parsed.data.title,
    },
  });
  return NextResponse.json(entry);
}
