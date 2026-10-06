import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { LEVEL_REGISTRY } from "@/lib/levels/registry";
import { validateFinalCoordinates } from "@/lib/config";

const ADMIN_COOKIE = "arcana_admin";

export async function POST(request: Request) {
  const body = await request.json();
  const schema = z.object({ password: z.string() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const hash = config.ADMIN_PASSWORD_HASH;
  if (!hash) {
    if (config.DEV_MODE || config.NODE_ENV === "development") {
      if (parsed.data.password === "arcana-dev") {
        const cookieStore = await cookies();
        cookieStore.set(ADMIN_COOKIE, "dev", { httpOnly: true, path: "/admin", maxAge: 3600 });
        return NextResponse.json({ success: true });
      }
    }
    return NextResponse.json({ error: "Admin no configurado" }, { status: 503 });
  }

  const valid = await bcrypt.compare(parsed.data.password, hash);
  if (!valid) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "authenticated", { httpOnly: true, path: "/admin", maxAge: 3600 });
  return NextResponse.json({ success: true });
}

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!auth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sessions = await db.gameSession.count();
  const attempts = await db.levelAttempt.count();
  const completed = await db.levelProgress.count({ where: { completed: true } });

  const levelStats = await db.levelProgress.groupBy({
    by: ["levelId"],
    _count: { levelId: true },
    _avg: { attempts: true },
    where: { completed: false, attempts: { gt: 3 } },
    orderBy: { _count: { levelId: "desc" } },
    take: 10,
  });

  let coordsValid = true;
  try {
    validateFinalCoordinates();
  } catch {
    coordsValid = false;
  }

  const implemented = LEVEL_REGISTRY.filter((l) => l.mechanic !== "stub").length;

  return NextResponse.json({
    stats: { sessions, attempts, completed, implemented, totalLevels: 100 },
    abandonment: levelStats,
    config: {
      gameName: config.GAME_NAME,
      finalLabel: config.FINAL_DESTINATION_LABEL,
      coordsValid,
      devMode: config.DEV_MODE,
    },
  });
}
