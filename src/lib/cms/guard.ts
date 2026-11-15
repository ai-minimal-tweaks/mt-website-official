import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

/** Second check inside each CMS handler, in case the proxy matcher is ever changed. */
export async function isSignedIn() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Case studies appear on /work, the home page, services, testimonials and their own pages: refresh them all. */
export function refreshSite() {
  revalidatePath("/", "layout");
}
