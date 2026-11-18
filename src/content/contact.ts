// Contact form options. Budget bands follow the "MT Homepage v2" form design.

export const serviceOptions = ["Creative Thinking", "Creative Scale", "Brand Content", "Social", "Campaigns", "Not sure yet"];
export const budgetOptions = ["Under ₹3L", "₹5–10L", "₹10L+", "Let’s discuss"];
export const timelineOptions = ["ASAP", "1–3 months", "3+ months", "Flexible"];

export const nextSteps = [
  { title: "We read it", body: "We go through your brief and line up the right people for it." },
  { title: "Discovery call", body: "A short call to understand the brand, the goal and the timeline." },
  { title: "Proposal", body: "A clear scope, timeline and cost for the first phase." },
];

/**
 * Free / disposable email providers that can't be used on the enquiry forms: only company addresses are accepted.
 * Add a domain here to block it (checked in the browser and again by /api/contact).
 */
export const blockedEmailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "yopmail.com"];

/** The part after "@", lower-cased ("" when there is none). */
export const emailDomain = (email: string) => email.trim().toLowerCase().split("@").pop() ?? "";

/** Null when the address is allowed, otherwise the message to show. */
export function workEmailProblem(email: string): string | null {
  const domain = emailDomain(email);
  if (!email.includes("@") || !blockedEmailDomains.includes(domain)) return null;
  return "Please enter an official email address only";
}

/** Mandatory fields of each homepage form (checked in the browser and again by /api/contact). */
export const requiredFields = {
  project: ["name", "email", "services", "budget", "timeline"],
  deck: ["name", "email", "company", "services"],
} as const;

export type EnquiryField = "name" | "email" | "company" | "services" | "budget" | "timeline" | "message";

const MISSING: Record<EnquiryField, string> = {
  name: "Please tell us your name.",
  email: "Please enter your email address.",
  company: "Please tell us your company name.",
  services: "Please pick at least one service.",
  budget: "Please pick a budget range.",
  timeline: "Please pick a timeline.",
  message: "Please add a message.",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Every problem with an enquiry, keyed by field (empty object = good to send). */
export function enquiryErrors(
  kind: "project" | "deck",
  f: {
    name?: string;
    email?: string;
    company?: string;
    services?: string[];
    budget?: string;
    timeline?: string;
    message?: string;
  },
): Partial<Record<EnquiryField, string>> {
  const errors: Partial<Record<EnquiryField, string>> = {};
  const filled = (k: EnquiryField) => {
    const v = f[k];
    return Array.isArray(v) ? v.length > 0 : !!v?.trim();
  };
  for (const k of requiredFields[kind]) if (!filled(k)) errors[k] = MISSING[k];
  const email = f.email?.trim() ?? "";
  if (email && !EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";
  else if (email && workEmailProblem(email)) errors.email = workEmailProblem(email)!;
  return errors;
}

/** The two homepage forms. "deck" asks for the credentials deck; "project" is a full project brief. */
export type EnquiryKind = "project" | "deck";

export type ContactPayload = {
  kind: EnquiryKind;
  name: string;
  email: string;
  company?: string;
  services: string[];
  budget?: string;
  timeline?: string;
  message?: string;
  source?: string;
};
