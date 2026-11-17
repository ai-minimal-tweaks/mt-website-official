import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/cms/auth";
import { isHiddenPage } from "@/lib/pages";

/**
 * 1. One-pager mode (src/lib/pages.ts): hidden pages redirect to the homepage (temporary 307, so search
 *    engines keep the URLs for when the pages come back). Signed-in CMS admins can still preview them.
 * 2. API requests that change data must come from this site (CSRF check).
 * 3. CMS guard: admin pages redirect to the login screen and CMS API calls get 401 without a valid session.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isHiddenPage(pathname)) {
    // Signed-in CMS admins can still open hidden pages (e.g. "View page" in the CMS) to preview them.
    if (await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
      const res = NextResponse.next();
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      res.headers.set("Cache-Control", "private, no-store");
      return res;
    }
    return NextResponse.redirect(new URL("/", req.url), 307);
  }

  // CSRF defence in depth (the session cookie is also SameSite=Strict): state-changing API calls must come from
  // this site. Browsers always send Origin on cross-site POST/PUT/DELETE, so a mismatch means another site.
  if (pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const fetchSite = req.headers.get("sec-fetch-site");
    if ((origin && origin !== req.nextUrl.origin) || (fetchSite && !["same-origin", "none"].includes(fetchSite))) {
      return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
    }
  }

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/cms")) return NextResponse.next();
  if (pathname === "/admin/login" || pathname === "/api/cms/login") return NextResponse.next();

  const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const login = new URL("/admin/login", req.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/cms/:path*",
    "/api/contact",
    // One-pager mode: every hidden page and everything below it.
    "/work/:path*",
    "/services/:path*",
    "/about/:path*",
    "/testimonials/:path*",
    "/contact/:path*",
    "/case-studies/:path*",
    "/become-a-tweaker/:path*",
  ],
};
