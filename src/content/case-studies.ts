// Case-study types and helpers, safe to import from client components.
// The records themselves live in /data/case-studies.json and are read and written by the CMS store
// (src/lib/cms/store.ts, server only), so new case studies go live without a code change.

export type Block =
  | { type: "p" | "li" | "h" | "quote"; text: string }
  | { type: "image"; src: string; alt: string }
  /** YouTube / Vimeo link or a direct video file (uploaded or hosted). Shown in the work showcase. */
  | { type: "video"; src: string; title?: string };

export type Category = "Branding" | "Content" | "Social" | "Campaigns" | "Web" | "SEO";

export type CaseStudyStatus = "published" | "draft";

export type CaseStudy = {
  id: string;
  /** URL segment: /work/case-study/<slug>. Derived from the client name. */
  slug: string;
  /** Old /case-studies/<slug> addresses that redirect here. */
  legacySlugs: string[];
  status: CaseStudyStatus;
  client: string;
  industry: string;
  service: string;
  categories: Category[];
  concept: boolean;
  /** ≥ 0: shown in the "Selected work" grid on /work, in ascending order. -1: client archive list. */
  featured: number;
  title: string;
  description: string;
  metaTitle: string;
  cover: string;
  metric: { value: string; label: string } | null;
  brief: Block[];
  approach: Block[];
  solution: Block[];
  conclusion: Block[];
  /** Optional quote shown on the page; when empty, a matching quote from content/testimonials.ts is used. */
  testimonial: { quote: string; name: string; role: string } | null;
  createdAt: string;
  updatedAt: string;
};

export const categories: Category[] = ["Branding", "Content", "Social", "Campaigns", "Web", "SEO"];

export const caseStudyHref = (slug: string) => `/work/case-study/${slug}`;

export const imagesOf = (c: CaseStudy) =>
  [...c.brief, ...c.approach, ...c.solution, ...c.conclusion].filter((b): b is Extract<Block, { type: "image" }> => b.type === "image");

/** Images and videos in page order (the first image becomes the approach visual on the page). */
export const mediaOf = (c: CaseStudy) =>
  [...c.brief, ...c.approach, ...c.solution, ...c.conclusion].filter(
    (b): b is Extract<Block, { type: "image" | "video" }> => b.type === "image" || b.type === "video",
  );

/**
 * Whether next/image may optimise this source. Only our own files and the hosts allowed in next.config.ts
 * (Webflow CDN, Vercel Blob) can be optimised; anything else a CMS editor pastes would make next/image throw,
 * so those images are passed through unoptimised.
 */
export function isUploaded(src: string) {
  if (src.startsWith("/images/")) return false;
  try {
    const host = new URL(src).hostname;
    return !(host === "cdn.prod.website-files.com" || host.endsWith(".public.blob.vercel-storage.com"));
  } catch {
    return true; // relative paths such as /api/media/… (disk uploads)
  }
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
