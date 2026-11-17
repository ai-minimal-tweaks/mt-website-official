/**
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 *  ONE-PAGER MODE  (see docs/one-pager-mode.md)
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 *  The site temporarily launches as a single page: only the homepage is visible. Every other page
 *  (/work, /work/case-study/*, /services, /about, /testimonials, /contact, and the old /case-studies/*
 *  and /become-a-tweaker addresses) stays in the code, but:
 *    • links to them are rewritten to homepage sections (or removed when there is no equivalent), and
 *    • visiting them directly redirects to the homepage (src/proxy.ts), and
 *    • they are marked noindex for search engines (src/app/layout.tsx).
 *
 *  TO UNHIDE ALL PAGES: set ONE_PAGER to false below. Nothing else needs to change: every link,
 *  redirect and noindex rule reads this flag. To unhide only some pages, remove them from HIDDEN_PAGES.
 *  The CMS (/admin) is never affected.
 * ─────────────────────────────────────────────────────────────────────────────────────────────────
 */
export const ONE_PAGER = true;

/**
 * WHICH HOMEPAGE IS LIVE  (see docs/one-pager-mode.md)
 *   "v2"      temporary launch homepage ("MT Homepage v2-temporary" design): TV-static intro where the visitor
 *             draws an M, then a single-screen hero, a brands carousel and two pop-up forms (start a project,
 *             request the deck). Code: src/components/home-v2/.
 *   "classic" the full scrolling homepage (Hero, About, Impact, Work, Ideas, Testimonials, FAQ, footer).
 *             Code: src/components/home/ClassicHome.tsx. Nothing was deleted.
 * TO RESTORE THE PREVIOUS / FULL HOMEPAGE: set HOMEPAGE to "classic". Independent of ONE_PAGER.
 */
export const HOMEPAGE: "v2" | "classic" = "v2";

/** Page paths hidden while ONE_PAGER is on. Each also hides everything below it (e.g. /work/case-study/x). */
export const HIDDEN_PAGES = ["/work", "/services", "/about", "/testimonials", "/contact", "/case-studies", "/become-a-tweaker"];

/** Homepage section ids that stand in for hidden pages. */
export const SECTION_FOR_PAGE: Record<string, string> = {
  "/work": "/#work",
  "/services": "/#ideas",
  "/about": "/#about",
  "/testimonials": "/#testimonials",
  "/contact": "/#contact",
};

const pathOf = (href: string) => href.split(/[?#]/)[0] || "/";

/** True when `href` (a site-relative path, with or without query/hash) points at a page hidden right now. */
export function isHiddenPage(href: string) {
  if (!ONE_PAGER || !href.startsWith("/")) return false;
  const path = pathOf(href);
  return HIDDEN_PAGES.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Where a link should point right now. Visible pages and external links are returned unchanged.
 * A hidden page maps to its homepage section; a hidden page with no section (a case study, careers)
 * returns null, and the caller renders it without a link.
 */
export function resolveHref(href: string, opts: { discoveryCall?: string } = {}): string | null {
  if (!isHiddenPage(href)) return href;
  if (href.startsWith("/contact#discovery-call") && opts.discoveryCall) return opts.discoveryCall;
  return SECTION_FOR_PAGE[pathOf(href)] ?? null;
}
