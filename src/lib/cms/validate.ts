import { categories, type Block, type CaseStudyStatus, type Category } from "@/content/case-studies";
import type { CaseStudyInput } from "./store";

const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
/** Media sources: absolute http(s) URLs or files served by our media route. */
const src = (v: unknown) => {
  const s = str(v, 2000);
  // https only (no http:, javascript:, data: …), or our own paths.
  if (s.startsWith("/api/media/") || s.startsWith("/images/")) return /^[\w/.-]+$/.test(s) && !s.includes("..") ? s : "";
  try {
    return new URL(s).protocol === "https:" ? s : "";
  } catch {
    return "";
  }
};

function blocks(v: unknown): Block[] {
  if (!Array.isArray(v)) return [];
  const out: Block[] = [];
  for (const raw of v.slice(0, 200)) {
    if (!raw || typeof raw !== "object") continue;
    const b = raw as Record<string, unknown>;
    if (b.type === "p" || b.type === "li" || b.type === "h" || b.type === "quote") {
      const text = str(b.text);
      if (text) out.push({ type: b.type, text });
    } else if (b.type === "image") {
      const s = src(b.src);
      if (s) out.push({ type: "image", src: s, alt: str(b.alt, 300) });
    } else if (b.type === "video") {
      const s = src(b.src);
      if (s) out.push({ type: "video", src: s, title: str(b.title, 200) || undefined });
    }
  }
  return out;
}

/** Turns an untrusted CMS form payload into a clean record, or returns the field errors. */
export function parseCaseStudy(body: unknown): { data: CaseStudyInput } | { errors: Record<string, string> } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const client = str(b.client, 120);
  const title = str(b.title, 200);
  if (!client) errors.client = "Client name is required.";
  if (!title) errors.title = "Title is required.";

  const cats = Array.isArray(b.categories) ? b.categories.filter((c): c is Category => (categories as string[]).includes(c as string)) : [];
  const metricValue = str((b.metric as Record<string, unknown> | null)?.value, 40);
  const t = (b.testimonial ?? null) as Record<string, unknown> | null;
  const quote = str(t?.quote, 1500);
  const featured = Number(b.featured);

  if (Object.keys(errors).length) return { errors };
  return {
    data: {
      slug: str(b.slug, 120),
      status: (b.status === "draft" ? "draft" : "published") as CaseStudyStatus,
      client,
      title,
      industry: str(b.industry, 120),
      service: str(b.service, 160),
      categories: [...new Set(cats)],
      concept: b.concept === true,
      featured: Number.isFinite(featured) && featured >= 0 ? Math.floor(featured) : -1,
      description: str(b.description, 500),
      metaTitle: str(b.metaTitle, 160),
      cover: src(b.cover),
      metric: metricValue ? { value: metricValue, label: str((b.metric as Record<string, unknown>)?.label, 160) } : null,
      brief: blocks(b.brief),
      approach: blocks(b.approach),
      solution: blocks(b.solution),
      conclusion: blocks(b.conclusion),
      testimonial: quote ? { quote, name: str(t?.name, 120), role: str(t?.role, 160) } : null,
    },
  };
}
