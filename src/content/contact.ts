// Contact form options. Budget bands follow the "MT Homepage v2" form design.

export const serviceOptions = ["Creative Thinking", "Creative Scale", "Brand Content", "Social", "Campaigns", "Not sure yet"];
export const budgetOptions = ["Under ₹3L", "₹5–10L", "₹10L+", "Let’s discuss"];
export const timelineOptions = ["ASAP", "1–3 months", "3+ months", "Flexible"];

export const nextSteps = [
  { title: "We read it", body: "We go through your brief and line up the right people for it." },
  { title: "Discovery call", body: "A short call to understand the brand, the goal and the timeline." },
  { title: "Proposal", body: "A clear scope, timeline and cost for the first phase." },
];

/** Who receives website enquiries (override with the CONTACT_TO env var, comma-separated). */
export const leadRecipients = ["anshul@minimaltweaks.com", "shubham@minimaltweaks.com"];

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
