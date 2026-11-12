// Case-study content migrated from the live minimaltweaks.com /case-studies/* pages (copy and image URLs as published).
// Regenerate case-studies.json with scripts/content/ (extract-case-studies.mjs → build-case-content.mjs); edit client/industry/category
// mapping there rather than by hand.
import data from "./case-studies.json";

export type Block = { type: "p" | "li" | "h" | "quote"; text: string } | { type: "image"; src: string; alt: string };

export type Category = "Branding" | "Content" | "Social" | "Campaigns" | "Web" | "SEO";

export type CaseStudy = {
  slug: string;
  client: string;
  industry: string;
  service: string;
  categories: Category[];
  concept: boolean;
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
};

export const caseStudies = data as CaseStudy[];

export const categories: Category[] = ["Branding", "Content", "Social", "Campaigns", "Web", "SEO"];

export const featuredStudies = caseStudies.filter((c) => c.featured >= 0);

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);

/** Next case to read: the following study in /work order, wrapping round. */
export const nextCaseStudy = (slug: string) => {
  const i = caseStudies.findIndex((c) => c.slug === slug);
  return caseStudies[(i + 1) % caseStudies.length];
};

export const imagesOf = (c: CaseStudy) =>
  [...c.brief, ...c.approach, ...c.solution, ...c.conclusion].filter((b): b is Extract<Block, { type: "image" }> => b.type === "image");
