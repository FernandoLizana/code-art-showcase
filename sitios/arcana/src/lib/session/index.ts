import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { GAME, config } from "@/lib/config";
import { db } from "@/lib/db";
import { generateSeed } from "@/lib/security/hash";
import type { SessionTokenPayload } from "@/types/game";

const encoder = new TextEncoder();

function getSecret(): Uint8Array {
  return encoder.encode(config.SESSION_SECRET);
}

export async function signSessionToken(payload: {
  sessionId: string;
  seed: string;
}): Promise<string> {
  return new SignJWT({ sessionId: payload.sessionId, seed: payload.seed })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionTokenPayload;
  } catch {
    return null;
  }
}

function generateRecoveryCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < GAME.recoveryCodeLength; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createGameSession(): Promise<{
  sessionId: string;
  seed: string;
  recoveryCode: string;
  token: string;
}> {
  const seed = generateSeed();
  const recoveryCode = generateRecoveryCode();

  const session = await db.gameSession.create({
    data: { seed, recoveryCode },
  });

  const token = await signSessionToken({
    sessionId: session.id,
    seed: session.seed,
  });

  return {
    sessionId: session.id,
    seed: session.seed,
    recoveryCode,
    token,
  };
}

export async function getSessionFromCookies(): Promise<{
  sessionId: string;
  seed: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GAME.cookieName)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const session = await db.gameSession.findUnique({
    where: { id: payload.sessionId },
  });
  if (!session) return null;

  return { sessionId: session.id, seed: session.seed };
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(GAME.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(GAME.cookieName);
}

export async function recoverSession(recoveryCode: string): Promise<string | null> {
  const session = await db.gameSession.findUnique({
    where: { recoveryCode: recoveryCode.toUpperCase().trim() },
  });
  if (!session) return null;

  return signSessionToken({ sessionId: session.id, seed: session.seed });
}
