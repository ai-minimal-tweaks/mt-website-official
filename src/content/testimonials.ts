// Client testimonials as published on the live minimaltweaks.com homepage and Webflow agency page.
// `result` lines only restate the quote itself or the linked case study's published headline.

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  brand: string;
  caseSlug?: string;
  result?: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "They designed and developed the website for my brand Finsense with the best of quality standards. I had the confidence in them also because they designed the brand identity. Their work is extremely good.",
    name: "Udit Lohiya",
    role: "CFO, Finsense",
    brand: "Finsense",
    caseSlug: "webflow-development-of-wealth-management-company",
    result: "Brand identity and Webflow website from one team",
  },
  {
    quote:
      "SEO was always our pain point, and their team helped us achieve the desired SEO results. We are ranking 1st on Google globally which has helped us grow organically by 10% in the last 3 months.",
    name: "Shubham Saurabh",
    role: "CEO, Jamsfy",
    brand: "Jamsfy",
    caseSlug: "jamstack-seo-case-study",
    result: "10% organic growth in 3 months",
  },
  {
    quote:
      "I had the pleasure of working with their team, as they did branding for Crunchy cashews. They are very accommodating, patient and give honest feedback. The brand identity and website is exactly what I envisioned!",
    name: "Nitesh Jindal",
    role: "Founder, Crunchy Cashews",
    brand: "Crunchy Cashews",
    caseSlug: "webflow-website-for-a-fmcg-brand",
    result: "Brand identity and website",
  },
  {
    quote:
      "We hired Minimal Tweaks to recreate our complex website in Webflow as well as make some changes. Shubham and his team worked with us through all the design edits and integrations and made sure we are 100% happy with the final result. They took care of every detail and we got exactly the website we were looking for.",
    name: "Anastasia Tarkhanova",
    role: "Sockrates Custom",
    brand: "Sockrates",
    caseSlug: "boosted-organic-traffic-by-68",
    result: "68% more organic traffic after the Webflow move",
  },
  {
    quote: "We hired Minimal Tweaks on our website redesign — they worked with us through heavy iterations and design tweaks.",
    name: "Austin Simon",
    role: "Co-Founder, Relay Commerce",
    brand: "Relay Commerce",
    caseSlug: "website-revamp-in-webflow-for-a-b2b-brand",
  },
  {
    quote:
      "We worked with Minimal Tweaks for our getting our landing pages developed on Webflow. The work was on time, matched the design 98% and only needed a few minor reviews.",
    name: "Akshay Gugale",
    role: "Dyte.io",
    brand: "Dyte",
  },
  {
    quote: "You are definitely on your way to finalise one of the best Webflow Agency. It was great to partner with them.",
    name: "Rakesh Kakkar",
    role: "Co-founder, Runne",
    brand: "Runne",
    caseSlug: "website-design-for-a-video-production-agency",
  },
];

/** Client brands with published work or testimonials — concept/spec work (Durex, boAt) is deliberately excluded. */
export const trustedBrands = [
  "CREX",
  "Finsense",
  "Crunchy Cashews",
  "Artwork Flow",
  "Relay Commerce",
  "Sockrates",
  "Pathkind Labs",
  "NorthStar Academy",
  "Urban Basics",
  "Jamsfy",
  "Runne",
  "Dyte",
];
