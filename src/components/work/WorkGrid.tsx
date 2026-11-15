"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { categories, type CaseStudy, type Category } from "@/content/case-studies";
import { CaseCard } from "@/components/shared";
import { Pill } from "@/components/ui";

gsap.registerPlugin(Flip, ScrollTrigger, useGSAP);

/**
 * Featured layout (2 large · 3 · 1 + "your brand" card) followed by the full archive. Choosing a category
 * collapses both into one filtered grid. The category lives in ?category= so it can be linked to.
 */
export function WorkGrid({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("category");
  const active = (categories as string[]).includes(raw ?? "") ? (raw as Category) : null;
  const root = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const featured = caseStudies.filter((c) => c.featured >= 0).sort((a, b) => a.featured - b.featured);
  const archive = caseStudies.filter((c) => c.featured < 0);
  const filtered = useMemo(() => (active ? caseStudies.filter((c) => c.categories.includes(active)) : []), [active, caseStudies]);

  const choose = (c: Category | null) => {
    if (root.current) flipState.current = Flip.getState(root.current.querySelectorAll("[data-card]"));
    const q = new URLSearchParams(params);
    if (c) q.set("category", c);
    else q.delete("category");
    router.replace(q.size ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  // Reveals are set up here, after this Suspense-wrapped component hydrates; the global data-anim layer
  // would otherwise touch this markup before React hydrates it (hydration mismatch).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 768px)" }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        // Cards swing up from depth in rows; each cover wipes open and dollies back from a close-up.
        gsap.set("[data-reveal]", { autoAlpha: 0, y: desktop ? 110 : 50, rotationX: desktop ? -22 : -10, transformPerspective: 1200, transformOrigin: "50% 0%" });
        gsap.set("[data-reveal] [data-card] > div:first-child", { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set("[data-reveal] [data-card] img", { scale: 1.4 });
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (els) => {
            gsap.to(els, { autoAlpha: 1, y: 0, rotationX: 0, duration: 1.3, stagger: 0.1, ease: "expo.out", clearProps: "transform" });
            els.forEach((el, i) => {
              gsap.to(el.querySelector("[data-card] > div:first-child"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, delay: i * 0.1, ease: "expo.inOut" });
              gsap.to(el.querySelector("[data-card] img"), { scale: 1, duration: 2, delay: i * 0.1, ease: "expo.out" });
            });
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, {
        duration: 0.75,
        ease: "expo.out",
        absolute: true,
        nested: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.03, ease: "expo.out" }),
      });
      flipState.current = null;
    },
    { dependencies: [active], scope: root },
  );

  return (
    <div ref={root}>
      <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <span className="eyebrow mr-2 shrink-0 text-ink/50">Filter</span>
        {([null, ...categories] as (Category | null)[]).map((c) => {
          const on = active === c;
          return (
            <button
              key={c ?? "all"}
              type="button"
              onClick={() => choose(c)}
              aria-pressed={on}
              className={`h-9 shrink-0 rounded-lg border px-3.5 text-xs font-medium transition-colors duration-300 ${
                on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/70 hover:border-ink/30"
              }`}
            >
              {c ?? "All"}
            </button>
          );
        })}
      </div>

      {active ? (
        <>
          <p className="mt-8 text-sm text-subtle" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "project" : "projects"} in {active}
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <div key={s.slug} data-reveal>
                <CaseCard study={s} reveal={false} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {featured.slice(0, 2).map((s, i) => (
              <div key={s.slug} data-reveal>
                <CaseCard study={s} size="lg" priority={i === 0} reveal={false} />
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(2, 5).map((s) => (
              <div key={s.slug} data-reveal>
                <CaseCard study={s} reveal={false} />
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {featured.slice(5).map((s) => (
              <div key={s.slug} data-reveal>
                <CaseCard study={s} reveal={false} />
              </div>
            ))}
            <div className="grid min-h-[18rem] place-items-center rounded-card border border-dashed border-ink/20 bg-white px-6 py-12 text-center lg:col-span-2">
              <div>
                <p className="text-heading font-medium leading-[1.05] tracking-[-0.04em]">
                  <span className="text-muted">Your brand</span>
                  <br />
                  <span className="accent">could be next.</span>
                </p>
                <div className="mt-6">
                  <Pill href="/contact" variant="flame" size="sm">
                    Start a project
                  </Pill>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-[clamp(1.6rem,1.1rem+1.6vw,2.4rem)] font-medium leading-[1.05] tracking-[-0.04em]">
              <span className="text-muted">More work.</span>
              <br />
              <span className="accent">The full archive.</span>
            </h2>
            <p className="max-w-xs font-serif text-subtle sm:text-right">
              Every case study we&apos;ve published — including our concept tweaks for brands we admire.
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {archive.map((s) => (
              <div key={s.slug} data-reveal>
                <CaseCard study={s} reveal={false} />
              </div>
            ))}
          </div>
        </>
      )}

      <p className="sr-only">
        <Link href="/contact">Start a project with Minimal Tweaks</Link>
      </p>
    </div>
  );
}
