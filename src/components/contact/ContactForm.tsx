"use client";

import { useState } from "react";
import { budgetOptions, serviceOptions, timelineOptions } from "@/content/contact";
import { Arrow } from "@/components/ui";

type Status = "idle" | "sending" | "sent" | "error";

function Chips({ label, options, value, onToggle }: { label: string; options: string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="text-[0.78rem] font-semibold">{label}</legend>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o)}
              className={`h-9 rounded-lg px-3 text-[0.75rem] font-semibold transition-colors duration-200 ${on ? "bg-ink text-white" : "bg-mist text-ink/80 hover:bg-mist-2"}`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

const field =
  "mt-2 h-12 w-full rounded-lg border border-line bg-mist px-4 text-sm text-ink placeholder:text-ink/35 transition focus:border-ink/40 focus:bg-white focus:outline-none";

export function ContactForm({ source = "contact-page" }: { source?: string }) {
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>("");
  const [timeline, setTimeline] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      company: form.get("company"),
      message: form.get("message"),
      website: form.get("website"),
      services,
      budget,
      timeline,
      source,
    };
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422) {
        setErrors(data.errors ?? {});
        setStatus("idle");
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event: "form_submit", form: "contact", services });
      setStatus("sent");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="grid min-h-[28rem] place-items-center text-center">
        <div>
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-ember text-2xl">✓</span>
          <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">Thanks — it&apos;s with us.</h2>
          <p className="mx-auto mt-3 max-w-xs font-serif text-lg text-subtle">We&apos;ll read your brief and come back with simple next steps.</p>
        </div>
      </div>
    );
  }

  const toggleOne = (set: (v: string) => void, cur: string) => (v: string) => set(cur === v ? "" : v);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-[0.78rem] font-semibold">
          Name *
          <input name="name" autoComplete="name" required placeholder="Your name" aria-invalid={!!errors.name} className={field} />
          {errors.name && <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.name}</span>}
        </label>
        <label className="block text-[0.78rem] font-semibold">
          Email *
          <input name="email" type="email" autoComplete="email" required placeholder="you@brand.com" aria-invalid={!!errors.email} className={field} />
          {errors.email && <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.email}</span>}
        </label>
      </div>
      <label className="block text-[0.78rem] font-semibold">
        Company
        <input name="company" autoComplete="organization" placeholder="Brand or company name" className={field} />
      </label>
      {/* Honeypot — hidden from people, filled by bots */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />

      <Chips label="Services interested in" options={serviceOptions} value={services} onToggle={(v) => setServices((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))} />
      <Chips label="Budget range" options={budgetOptions} value={budget ? [budget] : []} onToggle={toggleOne(setBudget, budget)} />
      <Chips label="Timeline" options={timelineOptions} value={timeline ? [timeline] : []} onToggle={toggleOne(setTimeline, timeline)} />

      <label className="block text-[0.78rem] font-semibold">
        Message
        <textarea name="message" rows={4} placeholder="Tell us about the brand and what you want it to do next." className={`${field} h-auto resize-y py-3`} />
      </label>

      {status === "error" && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {message} You can also email us at <a className="font-semibold underline" href="mailto:hello@minimaltweaks.com">hello@minimaltweaks.com</a>.
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[radial-gradient(120%_160%_at_85%_0%,#ff8a3d_0%,#b8400f_40%,#170a04_100%)] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(194,65,12,.9)] transition hover:brightness-110 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Start a project"}
          <Arrow className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
        <p className="text-xs text-subtle">
          By sending this you agree to our{" "}
          <a href="/privacy-policy" className="underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}
