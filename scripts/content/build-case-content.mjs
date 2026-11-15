// One-time migration (already run): raw.json → case-studies records. Records now live in /data/case-studies.json and are edited in the CMS at /admin; do not re-run over CMS edits.
// usage: node build-case-content.mjs <raw.json> <out.json>
import fs from "node:fs";

const [RAW, OUT] = process.argv.slice(2);
const raw = JSON.parse(fs.readFileSync(RAW, "utf8"));

// client · industry · work categories (the new design's filters) · metric only where the live page states one
const meta = {
  "social-media-marketing-for-cricket-app": ["CREX", "Sports & Fantasy", ["Social", "Campaigns"]],
  "building-a-brand-identity-for-a-finance-organization": ["Finsense", "Finance", ["Branding"]],
  "webflow-website-for-a-fmcg-brand": ["Crunchy Cashews", "FMCG", ["Web", "Branding"]],
  "website-revamp-for-a-brand-management-software": ["Artwork Flow", "SaaS", ["Web"]],
  "finance-community-marketing-case-study": ["NorthStar Academy", "Education", ["Social", "Content"]],
  "social-media-marketing-for-healthcare": ["Pathkind Labs", "Healthcare", ["Content", "Social"]],
  "boosted-organic-traffic-by-68": ["Sockrates", "D2C", ["Web", "SEO"], { value: "68%", label: "more organic traffic" }],
  "seo-case-study-for-d2c-brand": ["Spinbot", "D2C Gaming", ["SEO", "Content"], { value: "3X", label: "organic traffic" }],
  "seo-for-lifestyle-brand": ["Urban Basics", "Home & Lifestyle", ["SEO"], { value: "2X", label: "organic sales" }],
  "ux-ui-open-organic-seo-traffic": ["UX/UI Open", "Education", ["SEO", "Content"], { value: "24%", label: "more organic traffic" }],
  "brand-identity-design-for-a-clothing-brand": ["Omania", "Fashion · NGO", ["Branding"]],
  "brand-identity-revamp-noidagram": ["Noidagram", "Media & Community", ["Branding"]],
  "building-social-media-for-creator-agency": ["SocialTAG", "Creator Economy", ["Social", "Content"]],
  "concept-tweak-durex-spec-ads": ["Durex", "Concept tweak", ["Campaigns", "Content"], null, true],
  "floating-positive-communication-on-linkedin-for-boat": ["boAt", "Concept tweak", ["Campaigns", "Content"], null, true],
  "different-flavors-of-a-creative-agency": ["Minimal Tweaks", "Concept tweak", ["Campaigns", "Content"], null, true],
  "fix-it-with-amfixo-meme-marketing-campaign": ["Amfixo", "Services", ["Campaigns", "Social"]],
  "growing-cricket-fantasy-app": ["Cricket Exchange Fantasy", "Sports & Fantasy", ["Social", "Campaigns"]],
  "jamstack-seo-case-study": ["Jamsfy", "Technology", ["SEO", "Content"]],
  "launching-a-doctors-scrub-brand-online": ["OnCall", "Healthcare Apparel", ["Social", "Campaigns"]],
  "minimalistic-content-strategy-on-instagram": ["Shortpedia", "Media App", ["Content", "Social"]],
  "social-media-ad-campaign-for-an-ed-tech-brand": ["Parentof", "Ed-tech", ["Campaigns"]],
  "ui-ux-solution-for-myntra": ["Myntra", "Fashion e-commerce", ["Web"]],
  "webflow-development-for-healthcare": ["Inform8", "Healthcare Communications", ["Web"]],
  "webflow-development-of-wealth-management-company": ["Finsense", "Finance", ["Web"]],
  "website-design-for-a-video-production-agency": ["Runne", "Video Production", ["Web"]],
  "website-revamp-in-webflow-for-a-b2b-brand": ["Relay Commerce", "B2B SaaS", ["Web"]],
};

const featured = [
  "social-media-marketing-for-cricket-app",
  "building-a-brand-identity-for-a-finance-organization",
  "webflow-website-for-a-fmcg-brand",
  "website-revamp-for-a-brand-management-software",
  "finance-community-marketing-case-study",
  "social-media-marketing-for-healthcare",
];

const pick = (c, re) => c.sections.find((s) => re.test(s.heading))?.blocks ?? [];
const clean = (blocks) =>
  // 61d2ed18591a4a0bc8ba64e1 is the old Webflow template's own asset folder (banners, shapes) — not case-study imagery.
  blocks.filter((b) => (b.type === "image" ? !/61d2ed18591a4a0bc8ba64e1|footer|badge/i.test(b.src) : b.text && !/^project brief$/i.test(b.text)));

const out = raw.map((c) => {
  const m = meta[c.slug];
  if (!m) throw new Error(`no meta for ${c.slug}`);
  const [client, industry, categories, metric = null, concept = false] = m;
  const sec = {
    brief: clean(pick(c, /overview/i)),
    approach: clean(pick(c, /approach/i)),
    solution: clean(pick(c, /solution/i)),
    conclusion: clean(pick(c, /conclusion|result/i)),
  };
  const images = Object.values(sec).flat().filter((b) => b.type === "image");
  return {
    slug: c.slug,
    client,
    industry,
    service: c.tag,
    categories,
    concept,
    featured: featured.indexOf(c.slug),
    title: c.title,
    description: c.metaDescription,
    metaTitle: c.metaTitle,
    cover: c.ogImage || images[0]?.src || "",
    metric,
    ...sec,
  };
});
out.sort((a, b) => (a.featured < 0) - (b.featured < 0) || a.featured - b.featured);
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(`${out.length} case studies, ${out.filter((c) => c.featured >= 0).length} featured → ${OUT}`);
console.log("cover hosts:", [...new Set(out.map((c) => new URL(c.cover).host))].join(", "));
