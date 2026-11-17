import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_HOURS, authConfig, checkCredentials, createSessionToken } from "@/lib/cms/auth";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { bodyTooLarge } from "@/lib/security/request";

export async function POST(req: Request) {
  if (!authConfig()) {
    return NextResponse.json({ error: "CMS login isn't configured on this server yet (missing environment variables)." }, { status: 503 });
  }

  if (bodyTooLarge(req, 4_000)) return NextResponse.json({ error: "Request too large." }, { status: 413 });

  // 8 attempts per 15 minutes per IP.
  const limit = rateLimit(`login:${clientIp(req)}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { username?: unknown; password?: unknown };
  if (!(await checkCredentials(body.username, body.password))) {
    // Small fixed delay blunts rapid password guessing.
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  return res;
}
