"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ideaCards } from "@/content/home";
import { GradientField } from "@/components/three/GradientField";
import { Pill } from "@/components/ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Ideas() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 768px)", () => {
        // Cards fan up out of the glow as the band scrolls into view.
        gsap.from("[data-idea]", {
          yPercent: 45,
          rotateX: -35,
          rotateZ: (i: number) => (i - 1) * 4,
          autoAlpha: 0,
          transformOrigin: "50% 100%",
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-idea-row]", start: "top 92%", end: "top 45%", scrub: 0.8 },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // Pointer tilt — desktop only, ignored for touch.
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: x * 10, rotateX: -y * 10, y: -6, duration: 0.6, ease: "power3.out", transformPerspective: 900 });
  };
  const onLeave = (e: React.PointerEvent<HTMLElement>) =>
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.6)" });

  return (
    <section ref={root} id="ideas" className="relative isolate scroll-mt-24 overflow-hidden bg-ink py-20 text-white sm:py-28" aria-labelledby="ideas-title">
      <GradientField bias={[0.05, 0.22]} intensity={0.95} />
      <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />

      <div className="container-site relative">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 id="ideas-title" data-anim="lines" className="text-heading font-medium tracking-[-0.04em]">
              <span className="line-mask">
                <span>Ideas That Move</span>
              </span>
              <span className="line-mask">
                <span>Brands Forward</span>
              </span>
            </h2>
            <div data-anim="fade-up" className="mt-7">
              <Pill href="/contact" variant="light" size="sm">
                Start a project
              </Pill>
            </div>
          </div>
          <p data-anim="fade-up" className="max-w-md font-serif text-[1.05rem] leading-snug text-white/80 md:text-right">
            We combine creative thinking, strategic storytelling, and scalable design to build content that connects with
            audiences, strengthens brands, and turns ideas into meaningful impact.
          </p>
        </div>

        <div
          data-idea-row
          className="-mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:mt-20 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:[perspective:1200px]"
        >
          {ideaCards.map((card) => (
            <article
              key={card.title.join(" ")}
              data-idea
              onPointerMove={onMove}
              onPointerLeave={onLeave}
              className="relative w-[82%] shrink-0 snap-center pt-5 text-ink [transform-style:preserve-3d] will-change-transform md:w-auto"
            >
              {/* Folder tab */}
              <div aria-hidden className="absolute left-0 top-0 h-7 w-[46%] rounded-t-[1rem] bg-[#f4f4f3] [clip-path:polygon(0_0,82%_0,100%_100%,0_100%)]" />
              <div className="relative h-full rounded-b-[1.1rem] rounded-tr-[1.1rem] bg-[#f4f4f3] p-5 shadow-[0_40px_80px_-40px_rgba(0,0,0,.8)] sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[1.65rem] font-semibold leading-[0.95] tracking-[-0.045em]">
                    {card.title[0]}
                    <br />
                    {card.title[1]}
                  </h3>
                  <div className="flex flex-col items-end gap-3">
                    <span aria-hidden className="flex gap-1">
                      <i className="size-2 rounded-full bg-[#ff5f57]" />
                      <i className="size-2 rounded-full bg-[#febc2e]" />
                      <i className="size-2 rounded-full bg-[#28c840]" />
                    </span>
                    <p className="max-w-[7.5rem] text-right font-serif text-[0.72rem] leading-tight text-subtle">{card.blurb}</p>
                  </div>
                </div>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {card.chips.map((c) => (
                    <li key={c} className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[0.7rem] font-medium shadow-[0_4px_12px_-8px_rgba(0,0,0,.4)]">
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
