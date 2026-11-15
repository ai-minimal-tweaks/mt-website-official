import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./auth";
import { ReadOnlyStoreError } from "./store";

/** Second check inside each CMS handler, in case the proxy matcher is ever changed. */
export async function isSignedIn() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Turns a failed save into a JSON error: a clear 503 on read-only hosts, otherwise a generic 500. */
export function saveFailed(e: unknown) {
  if (e instanceof ReadOnlyStoreError) return NextResponse.json({ error: e.message }, { status: 503 });
  console.error("[cms] save failed", e);
  return NextResponse.json({ error: "Could not save. Try again." }, { status: 500 });
}

/** Case studies appear on /work, the home page, services, testimonials and their own pages: refresh them all. */
export function refreshSite() {
  revalidatePath("/", "layout");
}
