import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { bodyTooLarge } from "@/lib/security/request";
import { budgetOptions, serviceOptions, timelineOptions, type ContactPayload } from "@/content/contact";
import { emailConfigured, emailLead } from "@/lib/email/leads";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/**
 * Enquiries from the homepage pop-ups ("Start a project", "Request our deck") and /contact.
 * Delivered by email through Resend (RESEND_API_KEY) and/or to CONTACT_WEBHOOK_URL (Zapier, Make, a CRM…) as JSON.
 * With neither configured, local dev logs the lead; production returns 503 so nothing is dropped silently.
 */
export async function POST(req: Request) {
  if (bodyTooLarge(req, 20_000)) return NextResponse.json({ error: "Request too large." }, { status: 413 });
  // 5 enquiries per 10 minutes per IP is plenty for a person and stops scripted spam.
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many messages. Please try again a little later." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (clip(body.website, 200)) return NextResponse.json({ ok: true });

  const lead: ContactPayload = {
    kind: body.kind === "deck" ? "deck" : "project",
    name: clip(body.name, 120),
    email: clip(body.email, 200),
    company: clip(body.company, 160) || undefined,
    services: Array.isArray(body.services) ? body.services.filter((s): s is string => serviceOptions.includes(s as string)) : [],
    budget: budgetOptions.includes(body.budget as string) ? (body.budget as string) : undefined,
    timeline: timelineOptions.includes(body.timeline as string) ? (body.timeline as string) : undefined,
    message: clip(body.message, 5000) || undefined,
    source: clip(body.source, 120) || "contact",
  };

  const errors: Record<string, string> = {};
  if (!lead.name) errors.name = "Please tell us your name.";
  if (!EMAIL.test(lead.email)) errors.email = "Please enter a valid email address.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook && !emailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] lead (no RESEND_API_KEY or CONTACT_WEBHOOK_URL set):", lead);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "The form isn't connected yet." }, { status: 503 });
  }

  // Every configured channel is tried; the visitor sees success if at least one delivered the lead.
  const deliveries = await Promise.allSettled([
    emailConfigured() ? emailLead(lead) : Promise.reject(new Error("off")),
    webhook
      ? fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString() }),
          signal: AbortSignal.timeout(10_000),
        }).then((r) => {
          if (!r.ok) throw new Error(`webhook ${r.status}`);
        })
      : Promise.reject(new Error("off")),
  ]);
  if (!deliveries.some((d) => d.status === "fulfilled")) {
    return NextResponse.json({ error: "We couldn't send that just now." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
