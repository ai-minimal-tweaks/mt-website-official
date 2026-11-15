import { NextResponse } from "next/server";
import { createCaseStudy, listAll } from "@/lib/cms/store";
import { isSignedIn, refreshSite, saveFailed } from "@/lib/cms/guard";
import { parseCaseStudy } from "@/lib/cms/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isSignedIn())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json(listAll());
}

export async function POST(req: Request) {
  if (!(await isSignedIn())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const parsed = parseCaseStudy(await req.json().catch(() => null));
  if ("errors" in parsed) return NextResponse.json({ errors: parsed.errors }, { status: 422 });
  try {
    const record = createCaseStudy(parsed.data);
    refreshSite();
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    return saveFailed(e);
  }
}
