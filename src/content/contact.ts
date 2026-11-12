// Contact form options. The design leaves budget bands as "[set ranges]" — these are starting values to confirm.

export const serviceOptions = ["Creative Thinking", "Creative Scale", "Brand Content", "Social", "Campaigns", "Not sure yet"];
export const budgetOptions = ["Under ₹2L", "₹2–5L", "₹5L+", "Let's discuss"];
export const timelineOptions = ["ASAP", "1–3 months", "3+ months", "Flexible"];

export const nextSteps = [
  { title: "We read it", body: "We go through your brief and line up the right people for it." },
  { title: "Discovery call", body: "A short call to understand the brand, the goal and the timeline." },
  { title: "Proposal", body: "A clear scope, timeline and cost for the first phase." },
];

export type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  services: string[];
  budget?: string;
  timeline?: string;
  message?: string;
  source?: string;
};
