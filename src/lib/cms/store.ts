import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { list, put, del } from "@vercel/blob";
import { slugify, type CaseStudy } from "@/content/case-studies";

/**
 * Case-study store with two backends, chosen automatically:
 *
 *  • Vercel Blob, when a Blob store is connected to the Vercel project (BLOB_STORE_ID via OIDC, or
 *    BLOB_READ_WRITE_TOKEN; the SDK picks the credential itself). Each save writes
 *    a new snapshot `cms/records/<time>-<random>.json`; reads use the newest one. Snapshot URLs are unique, so no
 *    CDN cache can serve stale content, and the last 20 snapshots double as a version history.
 *  • The local file /data/case-studies.json otherwise (local development, or a server with a writable disk).
 *
 * The file in /data is also the seed: until the first CMS save on Vercel, the site reads the bundled file.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "case-studies.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const SNAPSHOT_PREFIX = "cms/records/";
const KEEP_SNAPSHOTS = 20;

export type StorageMode = "blob" | "file" | "read-only";

const useBlob = () => !!(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

/** Raised when there is nowhere to save: no Blob store and a read-only disk (e.g. Vercel without Blob). */
export class ReadOnlyStoreError extends Error {
  constructor() {
    super(
      "This server can't save changes yet: create a Public Blob store from the project's Storage page in Vercel, connect it to this project, and redeploy.",
    );
  }
}

const isReadOnly = (e: unknown) => ["EROFS", "EACCES", "EPERM"].includes((e as NodeJS.ErrnoException)?.code ?? "");

/** Where saves go right now (shown in the CMS). */
export function storageMode(): StorageMode {
  if (useBlob()) return "blob";
  return process.env.VERCEL ? "read-only" : "file";
}

/* ---------------------------------------------------------------- reading */

function readFile(): CaseStudy[] {
  return JSON.parse(fs.readFileSync(FILE, "utf8")) as CaseStudy[];
}

async function latestSnapshots() {
  const blobs = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: SNAPSHOT_PREFIX, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
}

async function readAll(): Promise<CaseStudy[]> {
  if (!useBlob()) return readFile();
  const [newest] = await latestSnapshots();
  if (!newest) return readFile(); // nothing saved from the CMS yet: use the bundled seed
  const res = await fetch(newest.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not read CMS records (${res.status}).`);
  return (await res.json()) as CaseStudy[];
}

/* ---------------------------------------------------------------- writing */

async function writeAll(records: CaseStudy[]) {
  const json = JSON.stringify(records, null, 2) + "\n";
  if (useBlob()) {
    await put(`${SNAPSHOT_PREFIX}${Date.now()}.json`, json, {
      access: "public",
      addRandomSuffix: true, // unguessable URL: drafts are not discoverable
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    // Keep a short history; older snapshots are removed.
    const old = (await latestSnapshots()).slice(KEEP_SNAPSHOTS);
    if (old.length) await del(old.map((b) => b.url)).catch(() => {});
    return;
  }
  try {
    // Temp file + rename, so a crash mid-write never leaves a half-written JSON file.
    const tmp = `${FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, json);
    fs.renameSync(tmp, FILE);
  } catch (e) {
    if (isReadOnly(e)) throw new ReadOnlyStoreError();
    throw e;
  }
}

/* ---------------------------------------------------------------- queries */

/** Every record, drafts included, in /work order. */
export const listAll = () => readAll();

/** Published records only, in /work order: what the public site shows. */
export const getCaseStudies = async () => (await readAll()).filter((c) => c.status === "published");

export const getCaseStudy = async (slug: string) => (await getCaseStudies()).find((c) => c.slug === slug);

export const getById = async (id: string) => (await readAll()).find((c) => c.id === id);

/** Current slug for an old /case-studies/<slug> address. */
export const findByLegacySlug = async (legacy: string) =>
  (await getCaseStudies()).find((c) => c.legacySlugs.includes(legacy) || c.slug === legacy);

/** Next case to read: the following published study in /work order, wrapping round. */
export async function nextCaseStudy(slug: string) {
  const all = await getCaseStudies();
  const i = all.findIndex((c) => c.slug === slug);
  return all[(i + 1) % all.length];
}

/** A slug not used by any other record: the client name, then -2, -3… */
function uniqueSlug(records: CaseStudy[], base: string, ignoreId?: string) {
  const taken = new Set(records.filter((c) => c.id !== ignoreId).map((c) => c.slug));
  const root = slugify(base) || "case-study";
  let s = root;
  for (let n = 2; taken.has(s); n++) s = `${root}-${n}`;
  return s;
}

/* ---------------------------------------------------------------- mutations */

export type CaseStudyInput = Omit<CaseStudy, "id" | "createdAt" | "updatedAt" | "legacySlugs">;

export async function createCaseStudy(input: CaseStudyInput) {
  const records = await readAll();
  const now = new Date().toISOString();
  const record: CaseStudy = {
    ...input,
    id: `cs_${randomUUID().slice(0, 8)}`,
    slug: uniqueSlug(records, input.slug || input.client),
    legacySlugs: [],
    createdAt: now,
    updatedAt: now,
  };
  // Newest work leads the /work page.
  await writeAll([record, ...records]);
  return record;
}

export async function updateCaseStudy(id: string, input: CaseStudyInput) {
  const records = await readAll();
  const i = records.findIndex((c) => c.id === id);
  if (i < 0) return null;
  const prev = records[i];
  const slug = uniqueSlug(records, input.slug || input.client, id);
  // Keep the old address working when a slug changes.
  const legacySlugs = slug !== prev.slug ? [...new Set([...prev.legacySlugs, prev.slug])] : prev.legacySlugs;
  const record: CaseStudy = { ...prev, ...input, slug, legacySlugs, updatedAt: new Date().toISOString() };
  records[i] = record;
  await writeAll(records);
  return record;
}

export async function deleteCaseStudy(id: string) {
  const records = await readAll();
  const next = records.filter((c) => c.id !== id);
  if (next.length === records.length) return false;
  await writeAll(next);
  return true;
}
