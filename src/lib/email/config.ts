import "server-only";

/**
 * Who sends and who receives website enquiries ("Start a project", "Request Deck", /contact).
 *
 * Change the defaults here, or override them without a code change by setting env vars in Vercel:
 *   CONTACT_TO    comma-separated recipients, e.g. "anshul@minimaltweaks.com, shubham@minimaltweaks.com"
 *   CONTACT_FROM  sender, e.g. "Minimal Tweaks <contact@minimaltweaks.com>" (its domain must be verified in Resend)
 * Sending needs RESEND_API_KEY.
 */
export const DEFAULT_RECIPIENTS = ["anshul@minimaltweaks.com", "shubham@minimaltweaks.com"];
export const DEFAULT_SENDER = "Minimal Tweaks <contact@minimaltweaks.com>";

const list = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function emailSettings() {
  const to = list(process.env.CONTACT_TO);
  return {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.CONTACT_FROM?.trim() || DEFAULT_SENDER,
    to: to.length ? to : DEFAULT_RECIPIENTS,
  };
}
