/**
 * CMS login. Credentials come from environment variables (set them in Vercel → Settings → Environment
 * Variables, and in .env.local for local development; see .env.example):
 *   CMS_USERNAME        the login name
 *   CMS_PASSWORD        the password (use a long random one)
 *   CMS_SESSION_SECRET  random string of 32+ characters used to sign session cookies; rotating it signs everyone out
 *
 * Fails closed: if any of them is missing (or the secret is too short), nobody can log in.
 * A successful login sets an httpOnly cookie holding a signed, expiring token. Uses Web Crypto so the same
 * code runs in the proxy and in route handlers.
 */

export const SESSION_COOKIE = "mt_cms_session";
export const SESSION_HOURS = 12;

const enc = new TextEncoder();
const toHex = (s: string) => Array.from(enc.encode(s), (b) => b.toString(16).padStart(2, "0")).join("");

type Config = { username: string; password: string; secret: string };

/** The configured credentials, or null when the CMS login is not set up. */
export function authConfig(): Config | null {
  const username = process.env.CMS_USERNAME?.trim();
  const password = process.env.CMS_PASSWORD;
  const secret = process.env.CMS_SESSION_SECRET;
  if (!username || !password || !secret || secret.length < 32) return null;
  return { username, password, secret };
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison for equal-length strings. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Compares submitted credentials without leaking their length or content through timing: both sides are
 * HMAC'd to fixed-length digests first, and both fields are always checked.
 */
export async function checkCredentials(username: unknown, password: unknown) {
  const cfg = authConfig();
  if (!cfg || typeof username !== "string" || typeof password !== "string") return false;
  const [u1, u2, p1, p2] = await Promise.all([
    hmac(cfg.secret, `u:${username.trim()}`),
    hmac(cfg.secret, `u:${cfg.username}`),
    hmac(cfg.secret, `p:${password}`),
    hmac(cfg.secret, `p:${cfg.password}`),
  ]);
  const userOk = safeEqual(u1, u2);
  const passOk = safeEqual(p1, p2);
  return userOk && passOk;
}

export async function createSessionToken() {
  const cfg = authConfig();
  if (!cfg) throw new Error("CMS login is not configured.");
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  // The username is part of the signed payload, so changing CMS_USERNAME also ends existing sessions.
  const payload = `${toHex(cfg.username)}.${expires}`;
  return `${payload}.${await hmac(cfg.secret, payload)}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  const cfg = authConfig();
  if (!cfg || !token || token.length > 512) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [user, exp, sig] = parts;
  const expires = Number(exp);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  if (user !== toHex(cfg.username)) return false;
  return safeEqual(sig, await hmac(cfg.secret, `${user}.${exp}`));
}
