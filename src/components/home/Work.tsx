"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { industries, projects, serviceTags, type ServiceTag } from "@/content/home";
import { Arrow, Chevron, SectionHeading, SmartLink } from "@/components/ui";
import { isHiddenPage, resolveHref } from "@/lib/pages";
import { ProjectArt } from "./ProjectArt";

gsap.registerPlugin(Flip, useGSAP);

type Filter = ServiceTag | "All";

export function Work() {
  const [tag, setTag] = useState<Filter>("All");
  const [picked, setPicked] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const visible = useMemo(
    () => projects.filter((p) => (tag === "All" || p.tag === tag) && (picked.length === 0 || picked.includes(p.industry))),
    [tag, picked],
  );

  // Capture layout before the state change, then animate cards from where they were.
  const capture = () => {
    if (gridRef.current) flipState.current = Flip.getState(gridRef.current.querySelectorAll("[data-card]"));
  };
  useGSAP(
    () => {
      if (!flipState.current) return;
      Flip.from(flipState.current, {
        duration: 0.7,
        ease: "expo.out",
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "expo.out" }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.92, duration: 0.35 }),
      });
      flipState.current = null;
    },
    { dependencies: [tag, picked], scope: gridRef },
  );

  const chooseTag = (t: Filter) => {
    capture();
    setTag(t);
  };
  const toggleIndustry = (i: string) => {
    capture();
    setPicked((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  };

  return (
    <section id="work" className="scroll-mt-24 py-16 sm:py-24" aria-labelledby="work-title">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading lead="A Peek at What" accent="We've Been Up To" />
          <p data-anim="fade-up" className="max-w-sm font-serif text-[1.05rem] leading-snug text-subtle md:text-right">
            From bold brand identities to thoughtful digital experiences, explore the ideas we&apos;ve shaped and the work
            we&apos;ve brought to life.
          </p>
        </div>

        <p id="work-title" data-anim="fade-up" className="mt-14 text-[0.95rem] text-subtle">
          Digital experience we&apos;ve tweaked
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-10">
          <aside data-anim="fade-up" className="h-fit min-w-0 rounded-card border border-line bg-white p-4 shadow-[0_20px_50px_-30px_rgba(0,0,0,.25)] lg:sticky lg:top-28">
            <p className="px-1 text-sm font-semibold">Filter projects by:</p>
            <div className="mt-3 space-y-2">
              <FilterGroup label="Industry">
                {industries.map((i) => (
                  <Check key={i} label={i} checked={picked.includes(i)} onChange={() => toggleIndustry(i)} />
                ))}
              </FilterGroup>
              <FilterGroup label="Service">
                {serviceTags.map((t) => (
                  <Check key={t} label={t} checked={tag === t} onChange={() => chooseTag(tag === t ? "All" : t)} />
                ))}
              </FilterGroup>
            </div>
            <p className="mt-4 px-1 text-xs text-muted">Service type</p>
            {/* Scrolls sideways on phones instead of wrapping into a tall block */}
            <div className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
              {(["All", ...serviceTags] as Filter[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => chooseTag(t)}
                  aria-pressed={tag === t}
                  className={`h-8 shrink-0 rounded-lg px-3 text-xs font-medium transition-colors duration-300 ${
                    tag === t ? "bg-ink text-white" : "bg-mist text-ink/70 hover:bg-mist-2"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <div ref={gridRef} data-anim="stagger" className="grid gap-5 sm:grid-cols-2" aria-live="polite">
              {visible.map((p) => (
                <SmartLink
                  key={p.slug}
                  href={p.href}
                  data-card
                  data-anim-item
                  data-tilt
                  data-flip-id={p.slug}
                  className="group relative block overflow-hidden rounded-card border border-line bg-mist p-2 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,.35)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[0.9rem]">
                    <div className="absolute inset-0 transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.05]">
                      <ProjectArt art={p.art} />
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-4 px-3 pb-3 pt-4">
                    <div>
                      <h3 className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-[-0.03em]">
                        {p.name}
                        <span className="rounded-md bg-ink px-2 py-0.5 text-[0.62rem] font-semibold tracking-normal text-white">{p.tag}</span>
                      </h3>
                      <p className="mt-1.5 text-[0.8rem] leading-snug text-subtle">{p.summary}</p>
                    </div>
                    {resolveHref(p.href) && (
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-ink transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-ink group-hover:text-white">
                        <Arrow className="size-3.5" />
                      </span>
                    )}
                  </div>
                </SmartLink>
              ))}
            </div>
            {visible.length === 0 && (
              <div className="grid place-items-center rounded-card border border-dashed border-line py-20 text-center">
                <p className="font-serif text-lg text-subtle">No featured projects for this filter yet.</p>
                {!isHiddenPage("/work") && (
                  <Link href="/work" className="mt-3 text-sm font-semibold text-flame underline-offset-4 hover:underline">
                    Browse all case studies
                  </Link>
                )}
              </div>
            )}
            {!isHiddenPage("/work") && (
              <div className="mt-8 flex justify-center lg:justify-start">
                <Link href="/work" className="group inline-flex items-center gap-2 text-sm font-semibold">
                  View all work
                  <Arrow className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg bg-mist">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between px-3 text-[0.7rem] font-semibold uppercase tracking-wider"
      >
        {label}
        <Chevron className={`size-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-500 ease-out-expo ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="space-y-1 px-3 pb-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-ink/80">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-[#ff6a1a]" />
      {label}
    </label>
  );
}
