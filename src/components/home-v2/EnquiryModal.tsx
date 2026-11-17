"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { buzz } from "./buzz";
import { SuccessScene } from "./SuccessScene";
import { pauseBackground } from "./pauseBackground";
import TechText from "@/components/motion/TechText";
import { useLenis } from "@/components/motion/MotionProvider";
import { budgetOptions, serviceOptions, timelineOptions, type EnquiryKind } from "@/content/contact";
import { forms } from "@/content/home-v2";
import { site } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";
type Values = {
  name: string;
  email: string;
  company: string;
  message: string;
  website: string;
};
type FieldId = "you" | "company" | "services" | "budget" | "timeline" | "message";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const STEPS: Record<EnquiryKind, FieldId[]> = {
  project: ["you", "company", "services", "budget", "timeline", "message"],
  deck: ["you", "company", "services", "message"],
};

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={`size-4 ${className}`}>
      <path
        d="M4 12 12 4M5.5 4H12v6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chips({
  legend,
  options,
  value,
  onPick,
}: {
  legend: string;
  options: string[];
  value: string[];
  onPick: (option: string) => void;
}) {
  return (
    <fieldset data-f>
      <legend className="text-[0.95rem] font-semibold">{legend}</legend>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={(e) => {
                gsap.fromTo(e.currentTarget, { scale: 0.86 }, { scale: 1, duration: 0.6, ease: "elastic.out(1.1, 0.4)" });
                buzz(8);
                onPick(o);
              }}
              className={`relative h-11 rounded-xl px-4 text-[0.95rem] font-semibold transition-[background,color,box-shadow] duration-300 ${
                on
                  ? "bg-ink text-white shadow-[0_6px_18px_-6px_rgba(255,106,26,.55)]"
                  : "bg-[#efefee] text-ink hover:bg-[#e6e6e4]"
              }`}
            >
              {on && (
                <span
                  aria-hidden
                  className="absolute -right-1 -top-1 size-2.5 rounded-full bg-[#FE9004] shadow-[0_0_10px_#ff6a1a]"
                />
              )}
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Field({
  label,
  required,
  error,
  valid,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  valid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label data-f className="block">
      <span className="text-[0.95rem] font-semibold">
        {label}
        {required && " *"}
      </span>
      <span data-error={error ? "" : undefined} className="field-alive relative mt-2.5 block rounded-xl">
        {children}
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className={`pointer-events-none absolute right-4 top-[1.15rem] size-4 text-[#2fa35a] transition-all duration-300 ${valid ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        >
          <path
            d="M3 8.5 6.5 12 13 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {error && <span className="mt-1.5 block text-[0.8rem] font-medium text-[#d9381e]">{error}</span>}
    </label>
  );
}

const input =
  "relative z-[1] block h-14 w-full rounded-xl border border-[#e3e3e1] bg-[#f5f5f5] px-4 pr-10 text-[1rem] text-ink caret-[#ff6a1a] placeholder:text-ink/35 transition-colors focus:border-transparent focus:bg-white focus:outline-none";

/**
 * Pop-up enquiry forms: "Start a project" (full brief) and "Request Deck", exactly as designed, on every screen size
 * (phones get the same form as a bottom sheet with single-column fields). Everything posts to /api/contact.
 */
export function EnquiryModal({ kind, onClose }: { kind: EnquiryKind | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !kind) return null;
  return createPortal(<Dialog key={kind} kind={kind} onClose={onClose} />, document.body);
}

function Dialog({ kind, onClose }: { kind: EnquiryKind; onClose: () => void }) {
  const copy = forms[kind];
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [v, setV] = useState<Values>({
    name: "",
    email: "",
    company: "",
    message: "",
    website: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failMsg, setFailMsg] = useState("");
  const closing = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const steps = STEPS[kind];
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  // Open: backdrop fades, the panel rises out of a blur, then every field drops in.
  useLayoutEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from("[data-backdrop]", {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        })
        .from(
          panel.current,
          {
            y: 60,
            scale: 0.94,
            rotateX: 12,
            filter: "blur(10px)",
            opacity: 0,
            duration: 0.9,
            transformPerspective: 1200,
          },
          0.05,
        )
        .from("[data-f]", { y: 26, opacity: 0, duration: 0.8, stagger: 0.05 }, 0.25);
    }, root);
    const firstInput = panel.current?.querySelector<HTMLInputElement>("input:not([tabindex='-1'])");
    const t = setTimeout(() => firstInput?.focus({ preventScroll: true }), 350);
    return () => {
      clearTimeout(t);
      ctx.revert();
      document.documentElement.style.overflow = prev;
      lenis?.start();
    };
  }, [lenis]);

  // The hero light behind the blurred backdrop stops drawing while the form is open (backdrop blur over a live
  // WebGL canvas is one of the most expensive things a browser can composite).
  useEffect(() => pauseBackground(), []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    gsap
      .timeline({ onComplete: onClose, defaults: { ease: "power3.in" } })
      .to(panel.current, {
        y: 40,
        opacity: 0,
        scale: 0.96,
        duration: 0.4,
      })
      .to("[data-backdrop]", { opacity: 0, duration: 0.3 }, 0.1);
  };

  // Escape closes; Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>("button, input, textarea, a[href]")].filter(
        (el) => el.tabIndex >= 0 && !el.hasAttribute("disabled"),
      );
      if (!f.length) return;
      const [first, last] = [f[0], f[f.length - 1]];
      if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
      else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const shake = (sel: string) =>
    gsap.fromTo(root.current!.querySelectorAll(sel), { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.25)" });

  const validateYou = () => {
    const e: Record<string, string> = {};
    if (!v.name.trim()) e.name = "Please tell us your name.";
    if (!EMAIL.test(v.email.trim())) e.email = "Please enter a valid email address.";
    setErrors(e);
    if (Object.keys(e).length) {
      shake("[data-error]");
      buzz([10, 40, 10]);
      return false;
    }
    return true;
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateYou()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          ...v,
          services,
          budget: kind === "project" ? budget[0] : undefined,
          timeline: kind === "project" ? timeline[0] : undefined,
          source: `home-v2-${kind}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422) {
        setErrors(data.errors ?? {});
        setStatus("idle");
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({
        event: "form_submit",
        form: kind === "deck" ? "request_deck" : "start_project",
        services,
      });
      setStatus("sent");
      buzz([20, 60, 30]);
    } catch (err) {
      setFailMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  const block = (id: FieldId) => {
    switch (id) {
      case "you":
        return (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <Field label="Name" required error={errors.name} valid={!!v.name.trim()}>
              <input
                name="name"
                autoComplete="name"
                value={v.name}
                onChange={set("name")}
                placeholder="Your name"
                className={input}
                maxLength={120}
              />
            </Field>
            <Field label="Email" required error={errors.email} valid={EMAIL.test(v.email.trim())}>
              <input
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={v.email}
                onChange={set("email")}
                placeholder="you@brand.com"
                className={input}
                maxLength={200}
              />
            </Field>
          </div>
        );
      case "company":
        return (
          <Field label="Company" valid={!!v.company.trim()}>
            <input
              name="company"
              autoComplete="organization"
              value={v.company}
              onChange={set("company")}
              placeholder="Brand or company name"
              className={input}
              maxLength={160}
            />
          </Field>
        );
      case "services":
        return (
          <Chips
            legend="Services interested in"
            options={serviceOptions}
            value={services}
            onPick={(o) => setServices((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]))}
          />
        );
      case "budget":
        return (
          <Chips
            legend="Budget range"
            options={budgetOptions}
            value={budget}
            onPick={(o) => setBudget((p) => (p[0] === o ? [] : [o]))}
          />
        );
      case "timeline":
        return (
          <Chips
            legend="Timeline"
            options={timelineOptions}
            value={timeline}
            onPick={(o) => setTimeline((p) => (p[0] === o ? [] : [o]))}
          />
        );
      case "message":
        return (
          <Field label="Message">
            <textarea
              name="message"
              value={v.message}
              onChange={set("message")}
              rows={5}
              maxLength={5000}
              placeholder="Tell us about the brand and what you want it to do next."
              className={`${input} h-auto resize-none py-4`}
            />
          </Field>
        );
    }
  };

  return (
    <div
      ref={root}
      // Lenis (smooth scrolling) otherwise swallows wheel/touch events, so the form couldn't scroll.
      data-lenis-prevent
      className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-title"
    >
      <div data-backdrop className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

      <div
        ref={panel}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--gx", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--gy", `${e.clientY - r.top}px`);
        }}
        className={`relative flex w-full flex-col overflow-hidden bg-white text-ink shadow-[0_40px_120px_-20px_rgba(0,0,0,.6)] ${
          // Same form on every screen size. Phones: a sheet rising from the bottom (rounded top corners, 12px of the
          // page still showing above it); larger screens: a centred card.
          "max-h-[calc(100svh-0.75rem)] max-w-[44rem] rounded-t-[1.5rem] sm:max-h-[calc(100svh-2rem)] sm:rounded-[1.75rem]"
        }`}
      >
        {/* Ember glow that follows the pointer across the panel. */}
        <div aria-hidden className="enquiry-glow pointer-events-none absolute inset-0" />

        {status !== "sent" && (
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 grid size-11 place-items-center rounded-full bg-[#efefee] text-ink transition hover:rotate-90 hover:bg-ink hover:text-white sm:right-6 sm:top-6"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
              <path d="M3.5 3.5l9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {status === "sent" ? (
          <SuccessScene
            kind={kind}
            panel={panel}
            backdrop={() => root.current?.querySelector("[data-backdrop]") ?? null}
            onDone={onClose}
          />
        ) : (
          <form onSubmit={submit} noValidate className="relative flex min-h-0 flex-1 flex-col">
            {/* Title row: stays put while the fields scroll under it. Once scrolled, it lifts off the page
                (shadow + hairline) and the title settles slightly smaller, so the layers read apart. */}
            <div
              data-scrolled={scrolled ? "" : undefined}
              className={`group/head relative z-[5] shrink-0 bg-white transition-shadow duration-300 data-[scrolled]:shadow-[0_18px_30px_-22px_rgba(11,11,11,.45)] ${"px-6 pb-2 pt-7 sm:px-12 sm:pt-12"}`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ff6a1a]/40 to-transparent opacity-0 transition-opacity duration-300 group-data-[scrolled]/head:opacity-100"
              />
              {/* data-f (entrance animation) sits on the outer box: GSAP writes inline translate/scale there, which
                    would cancel the inner box's alignment offset and scroll shrink. The inner box pulls the canvas left
                    by TechText's built-in 5% margin so the title lines up with the fields, and stays clear of ✕. */}
              <div data-f aria-hidden className="w-[min(calc(100%-3rem),26rem)]">
                <div className="h-[4.6rem] origin-left -translate-x-[5%] text-ink transition-[scale] duration-300 ease-out group-data-[scrolled]/head:scale-[0.86]">
                  <TechText
                    sweep={false}
                    text={copy.title}
                    fontSize={64}
                    fontWeight={700}
                    letterSpacing={-0.05}
                    align="left"
                    intro="type"
                    introDuration={0.9}
                    accentColor="#FE9004"
                    reach={140}
                    specks={8}
                  />
                </div>
              </div>
            </div>

            <div
              ref={scroller}
              onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-4 sm:px-12`}
            >
              <h2 id="enquiry-title" className="sr-only">
                {copy.title}
              </h2>

              <div className="grid gap-7">
                {steps.map((id) => (
                  <div key={id}>{block(id)}</div>
                ))}
              </div>

              {/* Honeypot: hidden from people, filled by bots. */}
              <input
                name="website"
                value={v.website}
                onChange={set("website")}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              {status === "error" && (
                <p role="alert" className="mt-6 rounded-xl bg-[#fff1e3] px-4 py-3 text-[0.9rem] text-ink">
                  {failMsg} You can also email us at{" "}
                  <a className="font-semibold underline underline-offset-2" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                  .
                </p>
              )}
            </div>

            <div
              className={`flex flex-wrap items-center gap-4 border-t border-[#efefee] bg-white justify-between px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-12 sm:py-6`}
            >
              {/* The entrance animation runs on this wrapper: the button's own CSS transition would fight it. */}
              <div data-f>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className={`cta-shimmer group relative inline-flex h-14 items-center justify-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-black via-[#4a1c05] to-[#c25a06] px-8 text-[1.1rem] font-bold tracking-[-0.02em] text-white shadow-[0_6px_0_#1a0a02,0_18px_40px_-12px_rgba(255,106,26,.6)] transition active:translate-y-[3px] active:shadow-[0_3px_0_#1a0a02] disabled:opacity-80`}
                >
                  {status === "sending" ? (
                    <span className="flex items-center gap-3">
                      Transmitting
                      <span className="flex gap-1" aria-hidden>
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="h-3 w-1 rounded-sm bg-white motion-safe:animate-[osd-blink_0.6s_steps(2)_infinite]"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </span>
                    </span>
                  ) : (
                    <>
                      {copy.submit}
                      <Arrow className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
              <p className="text-[0.85rem] text-ink/55">By sending this you agree to our Privacy Policy.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
