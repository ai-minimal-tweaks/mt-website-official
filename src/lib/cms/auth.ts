/**
 * CMS login. Credentials are fixed for now, as requested (no env vars, no database):
 * username "mtadmincms", password "mtadmincms". Change them here; move them to env vars before launch.
 *
 * A successful login sets an httpOnly cookie holding a signed, expiring token. Uses Web Crypto so the same
 * code runs in the proxy and in route handlers.
 */

export const CMS_USERNAME = "mtadmincms";
export const CMS_PASSWORD = "mtadmincms";
export const SESSION_COOKIE = "mt_cms_session";
export const SESSION_HOURS = 12;

// Signing key for session tokens. Rotating it signs everyone out.
const SECRET = "mt-cms-session-signing-key-v1-change-before-launch";

const enc = new TextEncoder();

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkCredentials(username: unknown, password: unknown) {
  return (
    typeof username === "string" &&
    typeof password === "string" &&
    safeEqual(username.trim(), CMS_USERNAME) &&
    safeEqual(password, CMS_PASSWORD)
  );
}

export async function createSessionToken() {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = `${CMS_USERNAME}.${expires}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const expires = Number(payload.split(".").pop());
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  return safeEqual(token.slice(i + 1), await hmac(payload));
}
