// Homepage copy and data. Copy is from the new design; testimonials and FAQ answers are carried over
// verbatim from the live minimaltweaks.com homepage. Move to the CMS (see content model in docs/architecture).

export type ServiceTag = "Social Media" | "UI/UX" | "Webflow" | "Branding" | "SEO";

export const serviceTags: ServiceTag[] = ["Social Media", "UI/UX", "Webflow", "Branding", "SEO"];

export type Project = {
  slug: string;
  name: string;
  tag: ServiceTag;
  industry: string;
  summary: string;
  href: string;
  art: "crex" | "artworkflow" | "crunchy" | "finsense";
};

// Card → case study mapping matched against the live site's case-study pages.
export const projects: Project[] = [
  {
    slug: "crex",
    name: "CREX",
    tag: "Social Media",
    industry: "Sports & Fantasy",
    summary: "Social media campaigns for India's cricket community",
    href: "/case-studies/social-media-marketing-for-cricket-app",
    art: "crex",
  },
  {
    slug: "artwork-flow",
    name: "Artwork Flow",
    tag: "Webflow",
    industry: "SaaS",
    summary: "A sharper digital experience for a brand management platform",
    href: "/case-studies/website-revamp-for-a-brand-management-software",
    art: "artworkflow",
  },
  {
    slug: "crunchy-cashews",
    name: "Crunchy Cashews",
    tag: "UI/UX",
    industry: "FMCG",
    summary: "A web experience for a growing FMCG brand",
    href: "/case-studies/webflow-website-for-a-fmcg-brand",
    art: "crunchy",
  },
  {
    slug: "finsense",
    name: "Finsense",
    tag: "Branding",
    industry: "Finance",
    summary: "Building a modern identity for a finance brand",
    href: "/case-studies/building-a-brand-identity-for-a-finance-organization",
    art: "finsense",
  },
];

export const industries = Array.from(new Set(projects.map((p) => p.industry)));

export const stats = [
  {
    eyebrow: "Our impact",
    value: 35,
    suffix: "+",
    label: "Brand Believers",
    body: "Brands that trust us to design, build and grow their digital presence.",
  },
  {
    eyebrow: "Global reach",
    value: 6,
    suffix: "+",
    label: "Industries Tweaked",
    body: "From D2C to Healthcare, we create digital solutions across multiple industries.",
  },
  {
    eyebrow: "Our community",
    value: 10,
    suffix: "K+",
    label: "Community of Tweakers",
    body: "A growing community of creators, marketers and brand builders who believe in minimal tweaks.",
  },
] as const;

export const ideaCards = [
  {
    title: ["Creative", "Thinking"],
    blurb: "Turning briefs into ideas worth making.",
    chips: ["Creative Concepts", "Campaign Ideas", "Content Ideas", "Creative Directions"],
  },
  {
    title: ["Creative", "Scale"],
    blurb: "Creative output built for brand-scale needs.",
    chips: ["Static / Video", "Performance Content", "Product Content", "AI / CGI"],
  },
  {
    title: ["Brand", "Content"],
    blurb: "Making brands part of the conversation.",
    chips: ["Social-first", "Content IPs", "Topical Moments", "Storytelling"],
  },
];

export const testimonials = [
  {
    quote:
      "They designed and developed the website for my brand Finsense with the best of quality standards. I had the confidence in them also because they designed the brand identity. Their work is extremely good.",
    name: "Udit Lohiya",
    role: "CFO, Finsense",
    result: {
      brand: "Finsense",
      summary:
        "With a fresh brand identity designed by Tweakers, Finsense went fully digital with a new website built on Webflow.",
      href: "/case-studies/webflow-development-of-wealth-management-company",
      art: "finsense" as const,
    },
  },
  {
    quote:
      "I had the pleasure of working with their team, as they did branding for Crunchy cashews. They are very accommodating, patient and give honest feedback. The brand identity and website is exactly what I envisioned!",
    name: "Nitesh Jindal",
    role: "Founder, Crunchy Cashews",
    result: {
      brand: "Crunchy Cashews",
      summary: "Brand identity and a website for a growing FMCG brand — built exactly as the founder envisioned.",
      href: "/case-studies/webflow-website-for-a-fmcg-brand",
      art: "crunchy" as const,
    },
  },
  {
    quote: "We hired Minimal Tweaks on our website redesign — they worked with us through heavy iterations and design tweaks.",
    name: "Austin Simon",
    role: "Co-Founder, Relay Commerce",
    result: {
      brand: "Relay Commerce",
      summary:
        "A website revamp in Webflow with a more consistent, modern visual design, better Core Web Vitals and a smoother browsing experience.",
      href: "/case-studies/website-revamp-in-webflow-for-a-b2b-brand",
      art: "artworkflow" as const,
    },
  },
];

export const faqs = [
  {
    q: "How can I test our compatibility as a brand and Agency?",
    a: "For better understanding of the approach, coordination and thought alignment, we suggest working on a small project or for a maximum duration of 3 months. This gives us and our Client great clarity in terms of growth, approach, and quality.",
  },
  {
    q: "Is Webflow really better than WordPress?",
    a: "Webflow is leading the current website development marketplace. Speed of designing and development, convenience of integrations, and easy staging makes this a tool that is incredibly hard to beat.",
  },
  {
    q: "As an early age startup do I really need digital strategy for building a brand?",
    a: "If your product is a product market fit then you must invest in marketing (not heavily) initially to amplify the solution to the target audience and get quick validation. But, if the product market fit is not achieved then invest more in development before marketing.",
  },
  {
    q: "Is it worth hiring a creative digital agency?",
    a: "The digital spectrum is evolving each and every day and it's very hard for business owners to hire a full-time team to take care of all that. This is why agencies are onboarded — to help a brand grow digitally with the latest techniques of digital mediums.",
  },
];
