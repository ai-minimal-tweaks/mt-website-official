import "server-only";
import type { ContactPayload } from "@/content/contact";
import { emailSettings } from "./config";

/** Emails a website enquiry through Resend's REST API (no SDK needed). Sender and recipients: ./config.ts. */

export const emailConfigured = () => !!emailSettings().apiKey;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
/** One line, no control characters: safe for a subject line. */
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

function render(lead: ContactPayload) {
  const title = lead.kind === "deck" ? "Deck request" : "New project enquiry";
  const rows: [string, string | undefined][] = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Company", lead.company],
    ["Services", lead.services.join(", ") || undefined],
    ["Budget", lead.budget],
    ["Timeline", lead.timeline],
    ["Message", lead.message],
    ["Form", lead.source],
  ];
  const filled = rows.filter((r): r is [string, string] => !!r[1]);
  const subject = oneLine(`${title}: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`).slice(0, 160);
  const text = `${title}\n\n${filled.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nReply to this email to answer ${lead.name} directly.`;
  const html = `<!doctype html><html><body style="margin:0;background:#f3f3f2;font-family:Inter,Arial,sans-serif;color:#0b0b0b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:#0b0b0b;padding:24px 28px;color:#fff;font-size:20px;font-weight:700">${esc(title)}
<div style="margin-top:6px;height:3px;width:56px;background:linear-gradient(90deg,#ff6a1a,#FE9004)"></div></td></tr>
${filled
  .map(
    ([k, v]) => `<tr><td style="padding:14px 28px;border-bottom:1px solid #ebebea">
<div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9a9a98">${esc(k)}</div>
<div style="margin-top:4px;font-size:15px;line-height:1.5;white-space:pre-wrap">${esc(v)}</div></td></tr>`,
  )
  .join("")}
<tr><td style="padding:18px 28px;font-size:12px;color:#5e5e5c">Reply to this email to answer ${esc(lead.name)} directly. Sent from minimaltweaks.com.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}

/** Sends the lead. Throws when Resend rejects it, so the caller can tell the visitor. */
export async function emailLead(lead: ContactPayload) {
  const cfg = emailSettings();
  const { subject, text, html } = render(lead);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: cfg.from,
      to: cfg.to,
      reply_to: lead.email,
      subject,
      text,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    // Logged server-side only (Vercel logs); the visitor gets a generic message.
    console.error("[contact] Resend rejected the email:", res.status, (await res.text().catch(() => "")).slice(0, 500));
    throw new Error("email failed");
  }
}
