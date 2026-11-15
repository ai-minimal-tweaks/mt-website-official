import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/cms/auth";

/** Guards the CMS: admin pages redirect to the login screen, CMS API calls get 401 without a valid session. */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/admin/login" || pathname === "/api/cms/login") return NextResponse.next();

  const ok = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const login = new URL("/admin/login", req.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/admin/:path*", "/api/cms/:path*"] };
