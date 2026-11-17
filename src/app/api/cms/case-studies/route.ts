import { NextResponse } from "next/server";
import { createCaseStudy, listAll } from "@/lib/cms/store";
import { isSignedIn, refreshSite, saveFailed } from "@/lib/cms/guard";
import { parseCaseStudy } from "@/lib/cms/validate";
import { bodyTooLarge } from "@/lib/security/request";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isSignedIn())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json(await listAll());
}

export async function POST(req: Request) {
  if (!(await isSignedIn())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (bodyTooLarge(req, 1_000_000)) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  const parsed = parseCaseStudy(await req.json().catch(() => null));
  if ("errors" in parsed) return NextResponse.json({ errors: parsed.errors }, { status: 422 });
  try {
    const record = await createCaseStudy(parsed.data);
    refreshSite();
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    return saveFailed(e);
  }
}
