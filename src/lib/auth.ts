import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "inv_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 jam, sama dengan backend Go lama

export interface SessionClaims {
  userId: string;
  email: string;
  name: string;
}

/**
 * The Go backend fell back to a hardcoded secret when JWT_SECRET was unset,
 * which meant anyone who read the repo could mint valid tokens (TRD S-1).
 * There is deliberately no fallback here.
 */
function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) {
    throw new Error("JWT_SECRET is not set. Refusing to sign or verify sessions.");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const { userId, email, name } = payload as unknown as SessionClaims;
    if (!userId || !email) return null;
    return { userId, email, name };
  } catch {
    return null;
  }
}

/** Cookie options. httpOnly closes TRD S-3 — the token is unreachable from JS. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/** Reads the current session from the request cookies, or null. */
export async function currentSession(): Promise<SessionClaims | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
