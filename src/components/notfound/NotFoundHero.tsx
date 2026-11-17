"use client";

import { useRef } from "react";
import Link from "next/link";
import { resolveHref } from "@/lib/pages";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { EmberRing } from "@/components/three/EmberRing";
import { GradientField } from "@/components/three/GradientField";
import { Arrow } from "@/components/ui";

gsap.registerPlugin(useGSAP);

const ticker = ["Page not found", "Ideas found everywhere else", "Still tweaking", "Back to the good stuff"];

/** A "4" wearing a Figma selection box — the page is mid-tweak. */
function Four({ side }: { side: "l" | "r" }) {
  return (
    <span data-four={side} className="relative inline-block px-[0.04em]">
      <span data-four-box aria-hidden className="absolute inset-x-0 inset-y-[0.12em] border border-ember/80" />
      {["-left-[3px] top-[0.12em] -translate-y-1/2", "-right-[3px] top-[0.12em] -translate-y-1/2", "-left-[3px] bottom-[0.12em] translate-y-1/2", "-right-[3px] bottom-[0.12em] translate-y-1/2"].map((pos) => (
        <span key={pos} data-four-handle aria-hidden className={`absolute ${pos} size-2 rounded-[2px] bg-ember sm:size-2.5`} />
      ))}
      <span className="relative">4</span>
    </span>
  );
}

export function NotFoundHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 768px)" }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;

        const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 });
        tl.from("[data-four='l']", { yPercent: 120, rotate: -14, duration: 1.3 })
          .from("[data-four='r']", { yPercent: 120, rotate: 14, duration: 1.3 }, "<0.08")
          .from("[data-ring]", { scale: 0, rotate: -90, duration: 1.4, ease: "elastic.out(1, 0.6)" }, "<0.15")
          .from("[data-four-box]", { scaleX: 0, transformOrigin: "left center", duration: 0.7, stagger: 0.12, ease: "power3.inOut" }, "-=0.8")
          .from("[data-four-handle]", { scale: 0, duration: 0.4, stagger: 0.03, ease: "back.out(3)" }, "-=0.35")
          .from("[data-nf-line]", { yPercent: 110, duration: 1, stagger: 0.08 }, "-=0.9")
          .from("[data-nf-fade]", { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, "-=0.7")
          .from("[data-nf-cursor]", { x: -120, y: 80, autoAlpha: 0, duration: 1.2, ease: "power3.out" }, "-=0.8");

        // The selection boxes keep "resizing" — someone is still tweaking this page.
        gsap.to("[data-four='l'] [data-four-box]", { scaleX: 1.06, scaleY: 0.94, transformOrigin: "left top", duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.4 });
        gsap.to("[data-four='r'] [data-four-box]", { scaleX: 0.95, scaleY: 1.05, transformOrigin: "right bottom", duration: 1.9, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.6 });

        // The "You" cursor wanders between the digits.
        gsap.to("[data-nf-cursor]", {
          keyframes: [
            { x: desktop ? 160 : 60, y: -30, duration: 2.2 },
            { x: desktop ? -40 : -20, y: 40, duration: 2.6 },
            { x: 0, y: 0, duration: 2 },
          ],
          repeat: -1,
          ease: "sine.inOut",
          delay: 2.8,
        });

        if (desktop) {
          // Pointer parallax: the 4s drift against the ring for depth.
          const lx = gsap.quickTo("[data-four='l']", "x", { duration: 0.8, ease: "power3.out" });
          const rx = gsap.quickTo("[data-four='r']", "x", { duration: 0.8, ease: "power3.out" });
          const ly = gsap.quickTo("[data-digits]", "y", { duration: 0.8, ease: "power3.out" });
          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            lx(nx * -26);
            rx(nx * 26);
            ly(ny * -14);
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          return () => window.removeEventListener("pointermove", onMove);
        }
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative p-2 sm:p-3" aria-labelledby="nf-title">
      <div className="relative isolate overflow-hidden rounded-[1.5rem] bg-ink text-white sm:rounded-shell">
        <GradientField bias={[0.05, 0.12]} intensity={0.9} priority />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,rgba(0,0,0,.45),transparent_75%)]" />

        <div className="container-site relative flex min-h-[calc(100svh-1rem)] flex-col items-center justify-center pb-24 pt-32 text-center sm:min-h-[calc(100svh-1.5rem)]">
          <p data-nf-fade className="eyebrow text-white/60">
            Error 404 <span className="text-white/35">· Page not found</span>
          </p>

          <div
            data-digits
            role="img"
            aria-label="404"
            className="relative mt-6 flex items-center justify-center text-[clamp(7rem,30vw,21rem)] font-semibold leading-[0.85] tracking-[-0.06em]"
          >
            <span className="overflow-hidden pb-[0.04em]">
              <Four side="l" />
            </span>
            <span data-ring className="mx-[0.02em] inline-block">
              <EmberRing className="h-[0.9em] w-[0.7em] align-middle" />
            </span>
            <span className="overflow-hidden pb-[0.04em]">
              <Four side="r" />
            </span>

            <span data-nf-cursor aria-hidden className="pointer-events-none absolute bottom-[8%] left-[56%] flex items-start">
              <svg viewBox="0 0 16 16" className="size-5 -rotate-12 text-ember drop-shadow" fill="currentColor">
                <path d="M2 1l12 6-5.2 1.3L6.5 14z" />
              </svg>
              <span className="ml-1 mt-3 rounded bg-ember px-1.5 py-0.5 text-[0.7rem] font-semibold tracking-normal text-ink">You</span>
            </span>
          </div>

          <h1 id="nf-title" className="mt-8 text-[clamp(1.9rem,1.2rem+2.4vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.04em]">
            <span className="line-mask">
              <span data-nf-line>This page didn&apos;t make</span>
            </span>
            <span className="line-mask">
              <span data-nf-line className="font-serif font-light italic tracking-[-0.03em] text-ember">
                the final cut.
              </span>
            </span>
          </h1>
          <p data-nf-fade className="mt-5 max-w-md font-serif text-lg leading-snug text-white/80">
            We tweaked it out of existence — or it never got past the first draft. Either way, the good work is still here.
          </p>

          <nav data-nf-fade aria-label="Popular pages" className="mt-9 flex flex-wrap justify-center gap-2.5">
            {[
              { label: "Back home", href: "/" },
              { label: "See our work", href: "/work" },
              { label: "Services", href: "/services" },
              { label: "Testimonials", href: "/testimonials" },
            ]
              // One-pager mode: hidden pages point at their homepage section (src/lib/pages.ts).
              .map((l) => ({ ...l, href: resolveHref(l.href) ?? "/" }))
              .map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className={`group inline-flex h-11 items-center gap-2 rounded-full px-5 text-[0.72rem] font-semibold uppercase tracking-[0.06em] transition ${
                  i === 0 ? "bg-white text-ink hover:bg-ember" : "border border-white/25 bg-white/10 backdrop-blur-md hover:bg-white/20"
                }`}
              >
                {l.label}
                <Arrow className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </nav>
        </div>

        <div aria-hidden className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-black/30 py-3 backdrop-blur-sm">
          <div className="flex w-max motion-safe:animate-[marquee_28s_linear_infinite]">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {[...ticker, ...ticker].map((t, i) => (
                  <span key={i} className="flex items-center gap-6 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                    {t}
                    <span className="size-1.5 rounded-full bg-ember" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
