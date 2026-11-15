import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isSignedIn } from "@/lib/cms/guard";
import { UPLOAD_DIR } from "@/lib/cms/store";

// Allowed upload types → stored extension. SVG is left out on purpose (it can carry scripts).
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const MAX_IMAGE = 15 * 1024 * 1024;
const MAX_VIDEO = 200 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isSignedIn())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Use a JPG, PNG, WebP, GIF, AVIF, MP4, WebM or MOV file." }, { status: 415 });
  const max = file.type.startsWith("video/") ? MAX_VIDEO : MAX_IMAGE;
  if (file.size > max) return NextResponse.json({ error: `File is larger than ${max / 1024 / 1024} MB.` }, { status: 413 });

  const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/media/${name}`, type: file.type.startsWith("video/") ? "video" : "image" }, { status: 201 });
}
