"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { testimonials } from "@/content/home";
import { Chevron, SectionHeading } from "@/components/ui";
import { ProjectArt } from "./ProjectArt";

export function Testimonials() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-slide]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.slide));
        });
      },
      { root: el, threshold: 0.6 },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const go = (i: number) => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>(`[data-slide="${(i + testimonials.length) % testimonials.length}"]`);
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2, behavior: "smooth" });
  };

  return (
    <section className="overflow-hidden py-16 sm:py-24" aria-labelledby="testimonials-title" aria-roledescription="carousel">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div id="testimonials-title">
            <SectionHeading lead="Small Tweaks, Big Love," accent="Lasting Impressions" />
          </div>
          <p data-anim="fade-up" className="max-w-md font-serif text-[1.05rem] leading-snug text-subtle md:text-right">
            Real words from the people who make our work worthwhile. Hear how our creative ideas and thoughtful design have
            made a difference to their brands.
          </p>
        </div>
      </div>

      <div
        ref={track}
        data-anim="fade-up"
        className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[6vw] pb-6 [scrollbar-width:none] sm:gap-6 md:px-[calc((100vw-min(58rem,86vw))/2)]"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(active + 1);
          if (e.key === "ArrowLeft") go(active - 1);
        }}
        tabIndex={0}
        aria-label="Client testimonials"
      >
        {testimonials.map((t, i) => (
          <article
            key={t.name}
            data-slide={i}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${testimonials.length}`}
            className={`grid w-[88vw] shrink-0 snap-center gap-4 rounded-[1.4rem] border border-line bg-mist p-3 transition-[opacity,scale,filter] duration-700 ease-out-expo sm:p-4 md:w-[min(58rem,86vw)] md:grid-cols-[1.25fr_1fr] ${
              i === active ? "scale-100 opacity-100" : "scale-[0.96] opacity-40 blur-[1px]"
            }`}
          >
            <div className="flex flex-col p-3 sm:p-5">
              <span className="w-fit rounded-md bg-ember px-2.5 py-1 text-xs font-semibold text-ink">★ 5.0</span>
              <blockquote className="mt-6 font-serif text-[1.15rem] leading-[1.45] text-ink sm:text-[1.3rem]">
                “{t.quote}”
              </blockquote>
              <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#d9a27a] to-[#6b3d22] text-sm font-semibold text-white">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-subtle">{t.role}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => go(i - 1)} aria-label="Previous testimonial" className="grid size-9 place-items-center rounded-full transition hover:bg-white">
                    <Chevron className="size-4 rotate-90" />
                  </button>
                  <span className="whitespace-nowrap text-xs tabular-nums text-subtle">
                    {String(i + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
                  </span>
                  <button type="button" onClick={() => go(i + 1)} aria-label="Next testimonial" className="grid size-9 place-items-center rounded-full transition hover:bg-white">
                    <Chevron className="size-4 -rotate-90" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-[1rem] bg-mist-2 p-4 sm:p-5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[0.68rem] font-semibold">
                <i className="size-1.5 rounded-full bg-ink" /> Results
              </span>
              <p className="mt-4 text-[0.82rem] leading-relaxed text-ink/75">{t.result.summary}</p>
              <Link href={t.result.href} className="group mt-6 flex items-center gap-3 rounded-xl bg-white p-2 pr-4 md:mt-auto">
                <span className="relative block size-16 shrink-0 overflow-hidden rounded-lg">
                  <ProjectArt art={t.result.art} />
                </span>
                <span>
                  <span className="eyebrow block text-[0.55rem] text-muted">Case study</span>
                  <span className="mt-1 flex items-center gap-1 text-lg font-semibold tracking-tight">
                    {t.result.brand}
                    <Chevron className="size-4 -rotate-90 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
