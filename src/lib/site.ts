// Global navigation, footer and contact data. URLs follow docs/architecture/sitemap-and-architecture.md —
// every link points at an existing minimaltweaks.com path.

export type NavLink = { label: string; href: string; external?: boolean };

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

export const primaryNav: NavLink[] = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/tweakers" },
  { label: "Insights", href: "/blogs" },
  { label: "Contact", href: "/talk" },
];

export const ctaLink: NavLink = { label: "Start a project", href: "/talk" };

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Services",
    links: [
      { label: "Social Media Marketing", href: "/services#social-media-marketing" },
      { label: "Branding & Identity", href: "/services#branding" },
      { label: "Webflow Development", href: "/webflow-development-agency" },
      { label: "UI/UX Designing", href: "/services#ui-ux" },
    ],
  },
  {
    title: "Help & Advice",
    links: [
      { label: "How We Tweak?", href: site.showreel, external: true },
      { label: "Blogs", href: "/blogs" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms and Conditions", href: "/terms-and-conditions" },
      { label: "Refund & Cancellations", href: "/refund-and-cancellations" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Expertise", href: "/services" },
      { label: "Tweakers", href: "/tweakers" },
      { label: "Become a Tweaker!", href: "/become-a-tweaker" },
      { label: "Work", href: "/work" },
      { label: "Contact Us", href: "/talk" },
    ],
  },
];

export type SocialKey = "x" | "instagram" | "linkedin" | "youtube" | "whatsapp";

export const socials: { key: SocialKey; label: string; href: string }[] = [
  { key: "x", label: "X (Twitter)", href: "https://twitter.com/minimaltweaks" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/minimal_tweaks" },
  { key: "linkedin", label: "LinkedIn", href: "https://in.linkedin.com/company/minimaltweaks" },
  { key: "youtube", label: "YouTube", href: "https://www.youtube.com/channel/UC0uAdhAul6tHNwfd_aJbwpw" },
  { key: "whatsapp", label: "WhatsApp", href: "https://wa.me/918127895558" },
];
