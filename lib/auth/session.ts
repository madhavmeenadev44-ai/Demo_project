import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { MockUser, UserRole, findUserById } from "@/lib/auth/users";

const COOKIE_NAME = "merchant_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Server-only signing secret (fallback provided for development convenience)
const AUTH_SECRET =
  process.env.AUTH_SECRET || "merchant-dashboard-dev-secret-key-2026-min-32-chars";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  exp: number; // Unix timestamp in ms
}

/**
 * Signs a session payload using HMAC SHA-256.
 */
function signToken(payload: SessionPayload): string {
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr, "utf8").toString("base64url");
  const signature = createHmac("sha256", AUTH_SECRET)
    .update(base64Payload)
    .digest("hex");
  return `${base64Payload}.${signature}`;
}

/**
 * Verifies and decodes a signed session token.
 * Returns payload if signature and expiry are valid, otherwise null.
 */
function verifyToken(token?: string | null): SessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;

  try {
    const expectedSig = createHmac("sha256", AUTH_SECRET)
      .update(base64Payload)
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSig, "hex");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const jsonStr = Buffer.from(base64Payload, "base64url").toString("utf8");
    const payload = JSON.parse(jsonStr) as SessionPayload;

    // Check expiry
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Creates and sets a signed HTTP-only session cookie for the authenticated user.
 */
export async function createSession(user: MockUser): Promise<void> {
  const cookieStore = await cookies();
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const token = signToken(payload);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Reads and verifies the session cookie, returning trusted MockUser or null.
 */
export async function getSessionUser(): Promise<MockUser | null> {
  await connection();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const payload = verifyToken(sessionCookie.value);
  if (!payload) {
    return null;
  }

  // Cross-reference with mock user store to verify user exists and role is current
  const user = findUserById(payload.userId);
  if (!user) {
    return null;
  }

  return user;
}

/**
 * Clears the session cookie on the server.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Route guard helper for Server Components.
 * Redirects unauthenticated requests to /login.
 */
export async function requireUser(): Promise<MockUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Guard helper verifying user is ADMIN.
 */
export async function requireAdmin(): Promise<MockUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin role required");
  }
  return user;
}

