import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { slugify, type CaseStudy } from "@/content/case-studies";

/**
 * File-backed store for case studies. No database: records live in /data/case-studies.json and uploads in
 * /data/uploads. Works wherever the Node server has a writable disk (local dev, `next start` on a VM).
 * Serverless hosts with read-only file systems (e.g. Vercel) would need a real store behind this module.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "case-studies.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

function readAll(): CaseStudy[] {
  return JSON.parse(fs.readFileSync(FILE, "utf8")) as CaseStudy[];
}

/** Raised when the host's file system cannot be written (e.g. Vercel serverless functions). */
export class ReadOnlyStoreError extends Error {
  constructor() {
    super(
      "This server can't save changes: its file system is read-only (for example on Vercel). Edit locally and redeploy, or connect a database or storage service.",
    );
  }
}

const isReadOnly = (e: unknown) => ["EROFS", "EACCES", "EPERM"].includes((e as NodeJS.ErrnoException)?.code ?? "");

function writeAll(list: CaseStudy[]) {
  try {
    writeFile(list);
  } catch (e) {
    if (isReadOnly(e)) throw new ReadOnlyStoreError();
    throw e;
  }
}

function writeFile(list: CaseStudy[]) {
  // Write to a temp file and rename, so a crash mid-write never leaves a half-written JSON file.
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2) + "\n");
  fs.renameSync(tmp, FILE);
}

/** Every record, drafts included, in /work order. */
export const listAll = () => readAll();

/** Published records only, in /work order: what the public site shows. */
export const getCaseStudies = () => readAll().filter((c) => c.status === "published");

export const getCaseStudy = (slug: string) => getCaseStudies().find((c) => c.slug === slug);

export const getById = (id: string) => readAll().find((c) => c.id === id);

/** Current slug for an old /case-studies/<slug> address. */
export const findByLegacySlug = (legacy: string) =>
  getCaseStudies().find((c) => c.legacySlugs.includes(legacy) || c.slug === legacy);

/** Next case to read: the following published study in /work order, wrapping round. */
export const nextCaseStudy = (slug: string) => {
  const list = getCaseStudies();
  const i = list.findIndex((c) => c.slug === slug);
  return list[(i + 1) % list.length];
};

/** A slug not used by any other record: the client name, then -2, -3… */
export function uniqueSlug(base: string, ignoreId?: string) {
  const taken = new Set(readAll().filter((c) => c.id !== ignoreId).map((c) => c.slug));
  const root = slugify(base) || "case-study";
  let s = root;
  for (let n = 2; taken.has(s); n++) s = `${root}-${n}`;
  return s;
}

export type CaseStudyInput = Omit<CaseStudy, "id" | "createdAt" | "updatedAt" | "legacySlugs">;

export function createCaseStudy(input: CaseStudyInput) {
  const list = readAll();
  const now = new Date().toISOString();
  const record: CaseStudy = {
    ...input,
    id: `cs_${randomUUID().slice(0, 8)}`,
    slug: uniqueSlug(input.slug || input.client),
    legacySlugs: [],
    createdAt: now,
    updatedAt: now,
  };
  // Newest work leads the /work page.
  writeAll([record, ...list]);
  return record;
}

export function updateCaseStudy(id: string, input: CaseStudyInput) {
  const list = readAll();
  const i = list.findIndex((c) => c.id === id);
  if (i < 0) return null;
  const prev = list[i];
  const slug = uniqueSlug(input.slug || input.client, id);
  // Keep the old address working when a slug changes.
  const legacySlugs = slug !== prev.slug ? [...new Set([...prev.legacySlugs, prev.slug])] : prev.legacySlugs;
  const record: CaseStudy = { ...prev, ...input, slug, legacySlugs, updatedAt: new Date().toISOString() };
  list[i] = record;
  writeAll(list);
  return record;
}

export function deleteCaseStudy(id: string) {
  const list = readAll();
  const next = list.filter((c) => c.id !== id);
  if (next.length === list.length) return false;
  writeAll(next);
  return true;
}
