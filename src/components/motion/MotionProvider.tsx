"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/**
 * Smooth scrolling (Lenis, desktop pointer only — touch devices keep native momentum scrolling)
 * plus declarative scroll animations. Sections opt in with data attributes:
 *   data-anim="lines"     heading lines (.line-mask > span) slide up
 *   data-anim="fade-up"   element rises and fades in
 *   data-anim="stagger"   [data-anim-item] children rise in sequence
 *   data-anim="count"     number counts up to data-value
 *   data-anim="parallax"  drifts by data-speed (yPercent) while scrolling
 *   data-anim="clip"      media unmasks from an inset frame while scrolling
 *   data-anim="draw"      SVG paths draw their stroke
 *   data-anim-pan         (phones) the <img> inside pans left→right while scrolling
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const instance = new Lenis({ autoRaf: false, lerp: 0.11, wheelMultiplier: 0.95 });
    const raf = (time: number) => instance.raf(time * 1000);
    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = instance;
    setLenis(instance);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });

    const mm = gsap.matchMedia();
    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 768px)" },
      (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);
        const trigger = (el: Element, start = "top 86%") => ({ trigger: el, start, once: true });

        q("[data-anim='lines']").forEach((el) => {
          gsap.from(el.querySelectorAll(".line-mask > span"), {
            yPercent: 112,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: trigger(el),
          });
        });

        q("[data-anim='fade-up']").forEach((el) => {
          gsap.from(el, { y: 36, autoAlpha: 0, duration: 1, ease: "expo.out", scrollTrigger: trigger(el) });
        });

        q("[data-anim='stagger']").forEach((el) => {
          gsap.from(el.querySelectorAll("[data-anim-item]"), {
            y: desktop ? 64 : 36,
            autoAlpha: 0,
            duration: 1,
            ease: "expo.out",
            stagger: desktop ? 0.1 : 0.06,
            scrollTrigger: trigger(el, "top 82%"),
          });
        });

        q("[data-anim='count']").forEach((el) => {
          const target = Number(el.dataset.value ?? 0);
          const counter = { v: 0 };
          el.textContent = "0";
          gsap.to(counter, {
            v: target,
            duration: 1.8,
            ease: "power3.out",
            scrollTrigger: trigger(el, "top 90%"),
            onUpdate: () => {
              el.textContent = String(Math.round(counter.v));
            },
          });
        });

        q("[data-anim='parallax']").forEach((el) => {
          const speed = Number(el.dataset.speed ?? -10) * (desktop ? 1 : 0.5);
          gsap.fromTo(
            el,
            { yPercent: -speed / 2 },
            {
              yPercent: speed / 2,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        q("[data-anim='clip']").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: desktop ? "inset(14% 10% 14% 10% round 32px)" : "inset(6% 4% 6% 4% round 20px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 20px)",
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 95%", end: "center 55%", scrub: 0.6 },
            },
          );
        });

        // Figma-style selection box drawn around a word, then its corner handles pop in.
        q("[data-anim='select']").forEach((el) => {
          gsap
            .timeline({ scrollTrigger: trigger(el, "top 92%"), delay: 0.35 })
            .from(el.querySelector("[data-select-box]"), { scaleX: 0, transformOrigin: "left center", duration: 0.8, ease: "power3.inOut" })
            .from(el.querySelectorAll("[data-select-handle]"), { scale: 0, duration: 0.45, stagger: 0.05, ease: "back.out(3)" }, "-=0.3");
        });

        // Dark page-hero shells recede as you scroll past them.
        q("[data-anim='shell']").forEach((el) => {
          gsap.to(el, {
            scale: desktop ? 0.94 : 0.97,
            borderRadius: desktop ? 44 : 30,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
          });
        });

        // Phones only: wide photos in taller frames pan sideways as they scroll through the viewport.
        if (!desktop) {
          q("[data-anim-pan] img").forEach((img) => {
            gsap.fromTo(
              img,
              { objectPosition: "0% 50%" },
              {
                objectPosition: "100% 50%",
                ease: "none",
                scrollTrigger: { trigger: img.closest("figure") ?? img, start: "top 85%", end: "bottom 25%", scrub: 0.6 },
              },
            );
          });
        }

        q<SVGPathElement>("[data-anim='draw'] path").forEach((path) => {
          const len = path.getTotalLength();
          gsap.fromTo(
            path,
            { strokeDasharray: len, strokeDashoffset: len },
            {
              strokeDashoffset: 0,
              duration: 2.2,
              ease: "power2.inOut",
              scrollTrigger: trigger(path.closest("[data-anim='draw']")!, "top 85%"),
            },
          );
        });
      },
    );

    // Trigger positions go stale when content above them changes height (fonts, images, accordions),
    // so re-measure whenever the document height changes, not just on window resize.
    let timer = 0;
    const refresh = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    let lastHeight = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastHeight) > 2) {
        lastHeight = h;
        refresh();
      }
    });
    ro.observe(document.body);
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [pathname]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
