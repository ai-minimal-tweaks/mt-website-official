"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { GradientField } from "@/components/three/GradientField";
import { Pill } from "@/components/ui";
import { HeroScene } from "@/components/three/HeroScene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 768px)" }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) {
          gsap.set("[data-hero-in]", { opacity: 1 });
          return;
        }

        // Intro. Un-hide first so the .from() tweens capture the visible state as their end values.
        gsap.set("[data-hero-in]", { opacity: 1, animation: "none" });
        gsap
          .timeline({ defaults: { ease: "expo.out" }, delay: 0.15 })
          .from("[data-hero-line]", { yPercent: 115, rotate: desktop ? 2 : 0, duration: 1.3, stagger: 0.11 })
          .from("[data-hero-box]", { scaleX: 0, transformOrigin: "left center", duration: 0.9, ease: "power3.inOut" }, "-=0.7")
          .from("[data-hero-handle]", { scale: 0, duration: 0.5, stagger: 0.05, ease: "back.out(3)" }, "-=0.35")
          .from("[data-hero-fade]", { y: 24, autoAlpha: 0, duration: 1, stagger: 0.12 }, "-=0.6");

        // Scroll-out: the shell recedes and the copy lifts away.
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        // Scroll-out: the camera pulls back and tips the shell away; the copy lifts and blurs out of focus.
        gsap.to("[data-hero-shell]", {
          scale: desktop ? 0.88 : 0.95,
          rotationX: desktop ? 10 : 5,
          transformPerspective: 1800,
          transformOrigin: "50% 100%",
          borderRadius: desktop ? 52 : 32,
          ease: "none",
          scrollTrigger: st,
        });
        gsap.to("[data-hero-copy]", {
          yPercent: desktop ? -30 : -14,
          scale: desktop ? 0.92 : 0.97,
          autoAlpha: 0.1,
          ...(desktop && { filter: "blur(6px)" }),
          ease: "none",
          scrollTrigger: st,
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative p-2 sm:p-3" aria-labelledby="hero-title">
      <div
        data-hero-shell
        className="relative isolate flex min-h-[calc(100svh-1rem)] items-center justify-center overflow-hidden rounded-[1.5rem] bg-ink text-white will-change-transform sm:min-h-[calc(100svh-1.5rem)] sm:rounded-shell"
      >
        <GradientField />
        <HeroScene variant="hero" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgba(0,0,0,.35),transparent_70%)]" />

        <div data-hero-copy className="relative z-10 flex flex-col items-center px-5 pb-16 pt-32 text-center sm:pt-36">
          <h1 id="hero-title" data-hero-in className="text-display font-medium tracking-[-0.045em]">
            <span className="line-mask">
              <span data-hero-line>Digital tweaks</span>
            </span>
            <span className="line-mask">
              <span data-hero-line>
                that make <em className="font-serif font-light italic tracking-[-0.03em]">brands</em> move.
              </span>
            </span>
            <span className="line-mask pt-[0.06em]">
              <span data-hero-line>
                within{" "}
                <span className="relative inline-block px-[0.12em]">
                  <span data-hero-box aria-hidden className="absolute inset-0 border border-ember/90 bg-ember/15" />
                  {(["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"] as const).map((pos) => (
                    <span
                      key={pos}
                      data-hero-handle
                      aria-hidden
                      className={`absolute ${pos} size-2 rounded-[2px] bg-ember motion-safe:animate-[handle-pulse_2.4s_ease-in-out_infinite]`}
                    />
                  ))}
                  <em className="relative font-serif font-light italic tracking-[-0.03em] text-ember">weeks.</em>
                </span>
              </span>
            </span>
          </h1>

          <p data-hero-in data-hero-fade className="mt-7 max-w-[26rem] font-serif text-[1.02rem] leading-snug text-white/85 sm:text-lg">
            Social media, performance marketing, Webflow, UI/UX and branding all the tweaks your brand needs to grow.
          </p>

          <div data-hero-in data-hero-fade className="mt-9">
            <Pill href="/contact" variant="glass">
              Let&apos;s start tweaking
            </Pill>
          </div>
        </div>

        <div data-hero-in data-hero-fade className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/60 sm:flex">
          <span className="eyebrow text-[0.6rem]">Scroll</span>
          <span className="relative h-10 w-px overflow-hidden bg-white/20">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-white motion-safe:animate-[scroll-cue_1.8s_ease-in-out_infinite]" />
          </span>
        </div>
      </div>
    </section>
  );
}
