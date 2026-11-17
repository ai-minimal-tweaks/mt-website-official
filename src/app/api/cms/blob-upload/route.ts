import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isSignedIn } from "@/lib/cms/guard";
import { IMAGE_TYPES, MAX_VIDEO_BYTES, VIDEO_TYPES } from "@/lib/cms/media-types";

/**
 * Issues short-lived client-upload tokens for Vercel Blob, so the CMS uploads files straight from the browser
 * (no 4.5 MB serverless request limit). Only signed-in admins get a token, and only for the CMS uploads folder
 * and the allowed media types. No completion callback is used.
 */
export async function POST(req: Request) {
  if (!(await isSignedIn())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  // Browser uploads need the store's long-lived read-write token to sign upload tokens (OIDC alone can't).
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Uploads need the Blob read-write token. In Vercel: Storage → your Blob store → Projects → ⋯ next to this project → Update Project Connection → tick “Add a read-write token env var to this connection”, then redeploy.",
      },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as HandleUploadBody | null;
  if (!body || body.type !== "blob.generate-client-token") return NextResponse.json({ error: "Bad request." }, { status: 400 });

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!/^cms\/uploads\/[\w.-]{1,120}$/.test(pathname) || pathname.includes("..")) throw new Error("Invalid upload path.");
        return {
          allowedContentTypes: [...IMAGE_TYPES, ...VIDEO_TYPES],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          addRandomSuffix: true,
          allowOverwrite: false,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload refused." }, { status: 400 });
  }
}
