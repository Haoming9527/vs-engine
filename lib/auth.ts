import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { SessionUser } from "@/lib/types";

const cookieName = "vs_session";

function secret() {
  return process.env.AUTH_SECRET || process.env.OPENAI_API_KEY || "vs-engine-dev";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(cookieName)?.value;
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const valid =
    expected.length === signature.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof parsed.email === "string" && typeof parsed.name === "string") {
      return { email: parsed.email, name: parsed.name };
    }
  } catch {
    return null;
  }

  return null;
}

export async function setSessionUser(user: SessionUser) {
  const store = await cookies();
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  store.set(cookieName, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionUser() {
  const store = await cookies();
  store.delete(cookieName);
}
