import { isHiddenPage, resolveHref } from "./pages";

// Global navigation, footer and contact data. URLs follow docs/architecture/sitemap-and-architecture.md.
// /contact replaces the old /talk page and /about replaces /tweakers (308s in next.config.ts); /testimonials is new.
// The blog (Insights) is not part of the revamp, so it is not linked anywhere.

export type NavLink = { label: string; href: string; external?: boolean; match?: string[] };

export const site = {
  name: "Minimal Tweaks",
  url: "https://minimaltweaks.com",
  description:
    "Social media, performance marketing, Webflow, UI/UX and branding — all the tweaks your brand needs to grow.",
  email: "hello@minimaltweaks.com",
  phones: ["+91-8077158782", "+91-8127895558"],
  address: "11th Floor, Tower-B, Unitech Cyber Park, Sector-39, Gurugram, Haryana 122003",
  showreel: "https://www.youtube.com/watch?v=IMwGgACXBAY",
  gtmId: "GTM-5R542TZ",
};

// `match` lists other path prefixes that light up the item (case studies live under Work).
// Full navigation. What is shown right now is `primaryNav` below, which applies one-pager mode (src/lib/pages.ts).
export const allNav: NavLink[] = [
  { label: "Work", href: "/work", match: ["/work", "/case-studies"] },
  { label: "Services", href: "/services", match: ["/webflow-development-agency"] },
  { label: "About", href: "/about", match: ["/tweakers"] },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
];

export const isActive = (item: NavLink, pathname: string) =>
  [item.href, ...(item.match ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));

const resolveLinks = (links: NavLink[]) =>
  links.flatMap((l) => {
    if (l.external) return [l];
    const href = resolveHref(l.href);
    return href ? [{ ...l, href }] : [];
  });

/** Header navigation as shown right now: in one-pager mode each item scrolls to its homepage section. */
export const primaryNav: NavLink[] = resolveLinks(allNav);

/** Mobile menu also lists Careers (dropped while it is hidden). */
export const mobileNav: NavLink[] = resolveLinks([...allNav, { label: "Careers", href: "/become-a-tweaker" }]);

export const ctaLink: NavLink = { label: "Start a project", href: resolveHref("/contact") ?? "/" };

const allFooterColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Services",
    links: [
      { label: "Social Media Marketing", href: "/work?category=Social" },
      { label: "Branding & Identity", href: "/services#creative-thinking" },
      { label: "Brand Content", href: "/services#brand-content" },
    ],
  },
  {
    title: "Help & Advice",
    links: [
      { label: "How We Tweak?", href: site.showreel, external: true },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms and Conditions", href: "/terms-and-conditions" },
      { label: "Refund & Cancellations", href: "/refund-and-cancellations" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Expertise", href: "/services" },
      { label: "About Us", href: "/about" },
      { label: "Become a Tweaker!", href: "/become-a-tweaker" },
      { label: "Work", href: "/work" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

/** Footer link columns as shown right now: in one-pager mode, links to hidden pages are left out. */
export const footerColumns = allFooterColumns
  .map((col) => ({ ...col, links: col.links.filter((l) => l.external || !isHiddenPage(l.href)) }))
  .filter((col) => col.links.length > 0);

export type SocialKey = "x" | "instagram" | "linkedin" | "youtube" | "whatsapp";

export const socials: { key: SocialKey; label: string; href: string }[] = [
  { key: "x", label: "X (Twitter)", href: "https://twitter.com/minimaltweaks" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/minimal_tweaks" },
  { key: "linkedin", label: "LinkedIn", href: "https://in.linkedin.com/company/minimaltweaks" },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/channel/UC0uAdhAul6tHNwfd_aJbwpw" },
  { key: "whatsapp", label: "WhatsApp", href: "https://wa.me/918127895558" },
];
