import { NextResponse } from "next/server";
import { deleteCaseStudy, getById, updateCaseStudy } from "@/lib/cms/store";
import { isSignedIn, refreshSite, saveFailed } from "@/lib/cms/guard";
import { parseCaseStudy } from "@/lib/cms/validate";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };
const unauthorized = () => NextResponse.json({ error: "Not signed in." }, { status: 401 });
const missing = () => NextResponse.json({ error: "Case study not found." }, { status: 404 });

export async function GET(_: Request, { params }: Ctx) {
  if (!(await isSignedIn())) return unauthorized();
  const record = getById((await params).id);
  return record ? NextResponse.json(record) : missing();
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!(await isSignedIn())) return unauthorized();
  const parsed = parseCaseStudy(await req.json().catch(() => null));
  if ("errors" in parsed) return NextResponse.json({ errors: parsed.errors }, { status: 422 });
  try {
    const record = updateCaseStudy((await params).id, parsed.data);
    if (!record) return missing();
    refreshSite();
    return NextResponse.json(record);
  } catch (e) {
    return saveFailed(e);
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!(await isSignedIn())) return unauthorized();
  try {
    if (!deleteCaseStudy((await params).id)) return missing();
    refreshSite();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return saveFailed(e);
  }
}
