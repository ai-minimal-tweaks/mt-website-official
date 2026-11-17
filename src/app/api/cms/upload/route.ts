import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isSignedIn } from "@/lib/cms/guard";
import { ReadOnlyStoreError, UPLOAD_DIR } from "@/lib/cms/store";
import { saveFailed } from "@/lib/cms/guard";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/cms/media-types";

// Disk uploads (local development / writable servers). On Vercel the CMS uploads to Blob instead (blob-upload route).
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/** Checks the file's first bytes, so a renamed file can't pass as an image or video. */
function sniff(buf: Buffer, type: string) {
  const hex = buf.subarray(0, 16).toString("hex");
  const ascii = buf.subarray(0, 16).toString("latin1");
  switch (type) {
    case "image/jpeg":
      return hex.startsWith("ffd8ff");
    case "image/png":
      return hex.startsWith("89504e470d0a1a0a");
    case "image/gif":
      return ascii.startsWith("GIF87a") || ascii.startsWith("GIF89a");
    case "image/webp":
      return ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP";
    case "image/avif":
    case "video/mp4":
    case "video/quicktime":
      return ascii.slice(4, 8) === "ftyp";
    case "video/webm":
      return hex.startsWith("1a45dfa3");
    default:
      return false;
  }
}

export async function POST(req: Request) {
  if (!(await isSignedIn())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
  const ext = EXT[file.type];
  if (!ext) return NextResponse.json({ error: "Use a JPG, PNG, WebP, GIF, AVIF, MP4, WebM or MOV file." }, { status: 415 });
  const max = file.type.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) return NextResponse.json({ error: `File is larger than ${max / 1024 / 1024} MB.` }, { status: 413 });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!sniff(bytes, file.type)) return NextResponse.json({ error: "The file's contents don't match its type." }, { status: 415 });

  const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${ext}`;
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), bytes);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException)?.code ?? "";
    return saveFailed(["EROFS", "EACCES", "EPERM"].includes(code) ? new ReadOnlyStoreError() : e);
  }
  return NextResponse.json({ url: `/api/media/${name}`, type: file.type.startsWith("video/") ? "video" : "image" }, { status: 201 });
}
