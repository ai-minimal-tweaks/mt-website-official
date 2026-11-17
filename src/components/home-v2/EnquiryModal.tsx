"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { buzz } from "./buzz";
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
type StepId = "you" | "company" | "services" | "budget" | "timeline" | "message";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const STEPS: Record<EnquiryKind, StepId[]> = {
  project: ["you", "company", "services", "budget", "timeline", "message"],
  deck: ["you", "company", "services", "message"],
};
/** Phone "levels": one question per screen. */
const LEVEL: Record<StepId, string> = {
  you: "Player one, who’s this?",
  company: "Which brand are we levelling up?",
  services: "Pick your power-ups",
  budget: "Choose your budget",
  timeline: "When do we launch?",
  message: "Any last words?",
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
 * Pop-up enquiry forms: "Start a project" (full brief) and "Request Deck". Desktop shows the whole form as
 * designed; phones play it as levels, one question per screen, with an XP bar. Everything posts to /api/contact.
 */
export function EnquiryModal({ kind, stepped, onClose }: { kind: EnquiryKind | null; stepped: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !kind) return null;
  return createPortal(<Dialog key={kind} kind={kind} stepped={stepped} onClose={onClose} />, document.body);
}

function Dialog({ kind, stepped, onClose }: { kind: EnquiryKind; stepped: boolean; onClose: () => void }) {
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
  const [step, setStep] = useState(0);
  const closing = useRef(false);

  const steps = STEPS[kind];
  const current = steps[step];
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
            y: stepped ? "100%" : 60,
            scale: stepped ? 1 : 0.94,
            rotateX: stepped ? 0 : 12,
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
    const t = setTimeout(() => firstInput?.focus({ preventScroll: true }), stepped ? 500 : 350);
    return () => {
      clearTimeout(t);
      ctx.revert();
      document.documentElement.style.overflow = prev;
      lenis?.start();
    };
  }, [lenis, stepped]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    gsap
      .timeline({ onComplete: onClose, defaults: { ease: "power3.in" } })
      .to(panel.current, {
        y: stepped ? "100%" : 40,
        opacity: stepped ? 1 : 0,
        scale: stepped ? 1 : 0.96,
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

  const goto = (next: number) => {
    const dir = next > step ? 1 : -1;
    gsap.to("[data-level]", {
      x: -40 * dir,
      opacity: 0,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => {
        setStep(next);
        requestAnimationFrame(() => {
          gsap.fromTo("[data-level]", { x: 40 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
          panel.current?.querySelector<HTMLElement>("[data-level] input, [data-level] textarea")?.focus({ preventScroll: true });
        });
      },
    });
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (stepped && step < steps.length - 1) {
      if (current === "you" && !validateYou()) return;
      buzz(12);
      return goto(step + 1);
    }
    if (!validateYou()) {
      if (stepped) goto(0);
      return;
    }
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
        if (stepped) goto(0);
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

  // Success screen animation.
  useEffect(() => {
    if (status !== "sent") return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo("[data-done-tv]", { scaleY: 0.01, scaleX: 0.3 }, { scaleY: 1, scaleX: 1, duration: 0.7 })
        .fromTo("[data-done-tick]", { strokeDashoffset: 40 }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" }, 0.35)
        .from("[data-done-copy] > *", { y: 20, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.4);
    }, root);
    return () => ctx.revert();
  }, [status]);

  const block = (id: StepId) => {
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
              rows={stepped ? 6 : 5}
              maxLength={5000}
              placeholder="Tell us about the brand and what you want it to do next."
              className={`${input} h-auto resize-none py-4`}
            />
          </Field>
        );
    }
  };

  const last = !stepped || step === steps.length - 1;
  const xp = ((step + 1) / steps.length) * 100;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-title"
    >
      <div data-backdrop className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={close} />

      <div
        ref={panel}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--gx", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--gy", `${e.clientY - r.top}px`);
        }}
        className={`relative flex w-full flex-col overflow-hidden bg-white text-ink shadow-[0_40px_120px_-20px_rgba(0,0,0,.6)] ${
          stepped ? "h-[100svh] rounded-none" : "max-h-[calc(100svh-2rem)] max-w-[44rem] rounded-[1.75rem]"
        }`}
      >
        {/* Ember glow that follows the pointer across the panel. */}
        <div aria-hidden className="enquiry-glow pointer-events-none absolute inset-0" />

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-[#efefee] text-ink transition hover:rotate-90 hover:bg-ink hover:text-white sm:right-6 sm:top-6"
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path d="M3.5 3.5l9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {status === "sent" ? (
          <div role="status" className="relative grid flex-1 place-items-center px-8 py-16 text-center sm:min-h-[30rem]">
            <div>
              <div
                data-done-tv
                className="mx-auto grid size-28 place-items-center rounded-[1.75rem] bg-ink shadow-[0_20px_60px_-15px_rgba(255,106,26,.7)]"
              >
                <svg viewBox="0 0 24 24" className="size-12 text-[#FE9004]" aria-hidden>
                  <path
                    data-done-tick
                    d="M5 12.5 10 17.5 19 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="40"
                  />
                </svg>
              </div>
              <div data-done-copy>
                <h2 id="enquiry-title" className="mt-8 text-[2.2rem] font-bold tracking-[-0.04em]">
                  {copy.done.title}
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-ink/65">{copy.done.body}</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-8 h-12 rounded-xl bg-ink px-6 font-semibold text-white transition hover:bg-[#FE9004] hover:text-ink"
                >
                  Back to the site
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="relative flex min-h-0 flex-1 flex-col">
            <div
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${stepped ? "px-6 pb-6 pt-6" : "px-8 pb-8 pt-10 sm:px-12 sm:pt-12"}`}
            >
              <h2 id="enquiry-title" className="sr-only">
                {copy.title}
              </h2>

              {stepped ? (
                <>
                  {/* HUD: level counter + XP bar */}
                  <div data-f className="pr-14 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ink/55">
                    {copy.title} · Level {String(step + 1).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}
                  </div>
                  <div data-f className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#efefee]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7a1d05] via-[#ff6a1a] to-[#ffb347] transition-[width] duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
                      style={{ width: `${xp}%` }}
                    />
                  </div>
                  <div data-level className="mt-10">
                    <p className="text-[2rem] font-bold leading-[1.05] tracking-[-0.045em]">{LEVEL[current]}</p>
                    <div className="mt-7">{block(current)}</div>
                  </div>
                </>
              ) : (
                <>
                  <div data-f className="h-[4.6rem] w-[min(100%,26rem)] -translate-x-[1.1rem] text-ink" aria-hidden>
                    <TechText
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
                  <div className="mt-6 grid gap-7">
                    {steps.map((id) => (
                      <div key={id}>{block(id)}</div>
                    ))}
                  </div>
                </>
              )}

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
              className={`flex flex-wrap items-center gap-4 border-t border-[#efefee] bg-white ${stepped ? "px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4" : "justify-between px-8 py-6 sm:px-12"}`}
            >
              {stepped && step > 0 && (
                <button
                  type="button"
                  onClick={() => goto(step - 1)}
                  className="h-14 rounded-2xl bg-[#efefee] px-5 font-semibold active:translate-y-0.5"
                >
                  Back
                </button>
              )}
              {/* The entrance animation runs on this wrapper: the button's own CSS transition would fight it. */}
              <div data-f className={stepped ? "flex-1" : ""}>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className={`cta-shimmer group relative inline-flex h-14 items-center justify-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-black via-[#4a1c05] to-[#c25a06] px-8 text-[1.1rem] font-bold tracking-[-0.02em] text-white shadow-[0_6px_0_#1a0a02,0_18px_40px_-12px_rgba(255,106,26,.6)] transition active:translate-y-[3px] active:shadow-[0_3px_0_#1a0a02] disabled:opacity-80 ${
                    stepped ? "w-full" : ""
                  }`}
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
                      {last ? copy.submit : "Next level"}
                      <Arrow className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </div>
              {last && <p className="text-[0.85rem] text-ink/55">By sending this you agree to our Privacy Policy.</p>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
