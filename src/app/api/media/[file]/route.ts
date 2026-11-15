import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { UPLOAD_DIR } from "@/lib/cms/store";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

/** Public delivery of CMS uploads (files added after a build are not served from /public by `next start`). */
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const name = (await params).file;
  // Only the generated names the upload route creates; never a path.
  if (!/^[a-z0-9]+-[a-f0-9]{8}\.[a-z0-9]+$/.test(name)) return new Response("Not found", { status: 404 });
  const type = MIME[name.split(".").pop()!];
  const file = path.join(UPLOAD_DIR, name);
  if (!type || !fs.existsSync(file)) return new Response("Not found", { status: 404 });
  const { size } = fs.statSync(file);
  const headers: Record<string, string> = {
    "Content-Type": type,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  };

  // Byte ranges let browsers seek in uploaded videos (Safari requires them to play video at all).
  const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    const stream = Readable.toWeb(fs.createReadStream(file, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }
  const stream = Readable.toWeb(fs.createReadStream(file)) as ReadableStream;
  return new Response(stream, { headers: { ...headers, "Content-Length": String(size) } });
}
