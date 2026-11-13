"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** Wraps every word of the element's text nodes in a span so it can be scrubbed. Nested markup is kept. */
function splitWords(el: HTMLElement) {
  if (el.dataset.split) return;
  el.dataset.split = "1";
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    const parts = (node.textContent ?? "").split(/(\s+)/);
    const frag = document.createDocumentFragment();
    parts.forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
      else {
        const w = document.createElement("span");
        w.dataset.w = "";
        w.className = "inline-block";
        w.textContent = part;
        frag.appendChild(w);
      }
    });
    node.replaceWith(frag);
  });
}

/**
 * Smooth scrolling (Lenis, desktop pointer only — touch devices keep native momentum scrolling)
 * plus declarative scroll animations. Sections opt in with data attributes:
 *   data-anim="lines"     heading lines (.line-mask > span) flip up out of their masks
 *   data-anim="fade-up"   element rises out of a soft blur
 *   data-anim="stagger"   [data-anim-item] children rise from depth in sequence
 *   data-anim="words"     paragraph lights up word by word as it scrolls through
 *   data-anim="count"     number counts up to data-value (from data-from, default 0)
 *   data-anim="parallax"  drifts by data-speed (yPercent) while scrolling
 *   data-anim="clip"      media unmasks from an inset frame and the image dollies out while scrolling
 *   data-anim="media"     frame wipes open once, then the image keeps a slow parallax
 *   data-anim="camera"    block swings up from a tilted, pulled-back camera into place (scrubbed)
 *   data-anim="drift"     oversized type slides sideways with scroll (data-speed, xPercent) and skews with velocity
 *   data-anim="hscroll"   (≥1024px) pins and scrolls [data-hscroll-track] sideways; cards turn as they pass
 *   data-anim="draw"      SVG paths draw their stroke
 *   data-anim="shell"     dark hero shells recede and tilt back as you scroll past
 *   data-anim="footer"    footer content rises from beneath the page
 *   data-anim-pan         (phones) the <img> inside pans left→right while scrolling
 *   data-magnetic         (fine pointer) element leans toward the cursor
 *   .liquid-glass         gets a specular highlight that follows the pointer
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Liquid-glass refraction uses an SVG backdrop filter that only Chromium renders; elsewhere the
    // glass falls back to blur + saturate. userAgentData exists only in Chromium browsers.
    if ("userAgentData" in navigator) document.documentElement.classList.add("lg-refract");

    const fine = matchMedia("(pointer: fine)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Specular highlight on glass + magnetic buttons. One listener for the whole page.
    let magnet: HTMLElement | null = null;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const glass = t?.closest?.<HTMLElement>(".liquid-glass");
      if (glass) {
        const r = glass.getBoundingClientRect();
        glass.style.setProperty("--gx", `${e.clientX - r.left}px`);
        glass.style.setProperty("--gy", `${e.clientY - r.top}px`);
      }
      if (!fine || reduce) return;
      const m = t?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== m) {
        gsap.to(magnet, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" });
      }
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        gsap.to(m, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.28,
          y: (e.clientY - (r.top + r.height / 2)) * 0.36,
          duration: 0.5,
          ease: "power3.out",
        });
      }
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const coarse = matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return () => window.removeEventListener("pointermove", onPointer);

    const instance = new Lenis({ autoRaf: false, lerp: 0.1, wheelMultiplier: 0.95 });
    const raf = (time: number) => instance.raf(time * 1000);
    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current = instance;
    setLenis(instance);

    return () => {
      window.removeEventListener("pointermove", onPointer);
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
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 768px)",
        wide: "(min-width: 1024px)",
      },
      (ctx) => {
        const { motion, desktop, wide } = ctx.conditions as { motion: boolean; desktop: boolean; wide: boolean };
        if (!motion) return;
        const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel);
        const trigger = (el: Element, start = "top 86%") => ({ trigger: el, start, once: true });
        // Blur is the most expensive part of a reveal; phones get the movement without it.
        const blur = (px: number) => (desktop ? { filter: `blur(${px}px)` } : {});

        q("[data-anim='lines']").forEach((el) => {
          gsap.from(el.querySelectorAll(".line-mask > span"), {
            yPercent: 118,
            rotationX: desktop ? -55 : -30,
            rotate: desktop ? 2.5 : 1.5,
            transformOrigin: "0% 100%",
            transformPerspective: 900,
            duration: 1.3,
            ease: "expo.out",
            stagger: 0.1,
            scrollTrigger: trigger(el),
          });
        });

        q("[data-anim='fade-up']").forEach((el) => {
          gsap.from(el, {
            y: desktop ? 70 : 40,
            scale: 0.97,
            autoAlpha: 0,
            ...blur(10),
            duration: 1.25,
            ease: "expo.out",
            clearProps: "filter,transform",
            scrollTrigger: trigger(el),
          });
        });

        q("[data-anim='stagger']").forEach((el) => {
          gsap.from(el.querySelectorAll("[data-anim-item]"), {
            y: desktop ? 110 : 50,
            rotationX: desktop ? -24 : -12,
            transformPerspective: 1200,
            transformOrigin: "50% 0%",
            autoAlpha: 0,
            ...blur(8),
            duration: 1.3,
            ease: "expo.out",
            stagger: desktop ? 0.11 : 0.07,
            clearProps: "filter,transform",
            scrollTrigger: trigger(el, "top 84%"),
          });
        });

        // Statement copy lights up word by word, tied to the scroll position.
        q("[data-anim='words']").forEach((el) => {
          splitWords(el);
          gsap.fromTo(
            el.querySelectorAll("[data-w]"),
            { opacity: 0.14, y: desktop ? 6 : 3 },
            {
              opacity: 1,
              y: 0,
              ease: "none",
              stagger: 0.08,
              scrollTrigger: { trigger: el, start: "top 88%", end: desktop ? "bottom 58%" : "bottom 68%", scrub: 0.6 },
            },
          );
        });

        q("[data-anim='count']").forEach((el) => {
          const target = Number(el.dataset.value ?? 0);
          const from = Number(el.dataset.from ?? 0);
          const counter = { v: from };
          el.textContent = String(from);
          gsap.to(counter, {
            v: target,
            duration: 2,
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

        // Frame opens from an inset rounded window while the image inside dollies back from a close-up.
        q("[data-anim='clip']").forEach((el) => {
          const st = { trigger: el, start: "top 98%", end: "center 52%", scrub: 0.7 };
          gsap.fromTo(
            el,
            { clipPath: desktop ? "inset(16% 12% 16% 12% round 40px)" : "inset(8% 6% 8% 6% round 24px)" },
            { clipPath: "inset(0% 0% 0% 0% round 20px)", ease: "none", scrollTrigger: st },
          );
          const img = el.querySelector("img");
          if (img) gsap.fromTo(img, { scale: desktop ? 1.35 : 1.2 }, { scale: 1, ease: "none", scrollTrigger: st });
        });

        // One-shot wipe for smaller media (cards, portraits), then a slow parallax inside the frame.
        q("[data-anim='media']").forEach((el) => {
          const img = el.querySelector("img");
          gsap.fromTo(
            el,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", scrollTrigger: trigger(el, "top 92%") },
          );
          if (!img) return;
          gsap.fromTo(img, { scale: 1.45 }, { scale: 1.12, duration: 2, ease: "expo.out", scrollTrigger: trigger(el, "top 92%") });
          gsap.fromTo(
            img,
            { yPercent: -5 },
            { yPercent: 5, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });

        // Cinematic camera: the block starts pulled back and tipped away, then swings level as it arrives.
        q("[data-anim='camera']").forEach((el) => {
          gsap.fromTo(
            el,
            { rotationX: desktop ? 18 : 9, scale: desktop ? 0.84 : 0.92, y: desktop ? 140 : 50, transformPerspective: 1600, transformOrigin: "50% 0%" },
            {
              rotationX: 0,
              scale: 1,
              y: 0,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: desktop ? "top 22%" : "top 45%", scrub: 0.8 },
            },
          );
        });

        q("[data-anim='drift']").forEach((el) => {
          const speed = Number(el.dataset.speed ?? -20) * (desktop ? 1 : 0.6);
          gsap.fromTo(
            el,
            { xPercent: 0 },
            { xPercent: speed, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.5 } },
          );
        });

        // Dark hero shells: the camera pulls back and tips the shell away while the copy lifts off.
        q("[data-anim='shell']").forEach((el) => {
          const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
          gsap.to(el, {
            scale: desktop ? 0.9 : 0.95,
            rotationX: desktop ? 8 : 4,
            transformPerspective: 1800,
            transformOrigin: "50% 100%",
            borderRadius: desktop ? 48 : 30,
            ease: "none",
            scrollTrigger: st,
          });
          const copy = el.querySelector(":scope > .container-site, :scope [data-shell-copy]");
          if (copy) gsap.to(copy, { yPercent: desktop ? -22 : -10, autoAlpha: 0.2, ease: "none", scrollTrigger: st });
        });

        // Footer content rises from under the page as it is uncovered.
        q("[data-anim='footer']").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: desktop ? -18 : -8 },
            { yPercent: 0, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "top 30%", scrub: true } },
          );
        });

        // Pinned sideways track (wide screens). Phones and tablets keep a native swipe row.
        if (wide) {
          q("[data-anim='hscroll']").forEach((section) => {
            const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
            if (!track) return;
            const distance = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
            const tween = gsap.to(track, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            });
            track.querySelectorAll("[data-hscroll-item]").forEach((card) => {
              gsap.fromTo(
                card,
                { rotationY: -16, scale: 0.9, transformPerspective: 1200, transformOrigin: "0% 50%" },
                {
                  rotationY: 0,
                  scale: 1,
                  ease: "none",
                  scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "center 60%", scrub: true },
                },
              );
            });
          });
        }

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

        // Figma-style selection box drawn around a word, then its corner handles pop in.
        q("[data-anim='select']").forEach((el) => {
          gsap
            .timeline({ scrollTrigger: trigger(el, "top 92%"), delay: 0.35 })
            .from(el.querySelector("[data-select-box]"), { scaleX: 0, transformOrigin: "left center", duration: 0.8, ease: "power3.inOut" })
            .from(el.querySelectorAll("[data-select-handle]"), { scale: 0, duration: 0.45, stagger: 0.05, ease: "back.out(3)" }, "-=0.3");
        });

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

        // Scroll velocity bends drifting type and marked elements, then they spring back upright.
        const skewed = q("[data-anim='drift'], [data-skew]");
        if (skewed.length) {
          const max = desktop ? 7 : 3;
          const setters = skewed.map((el) => gsap.quickTo(el, "skewX", { duration: 0.6, ease: "power3.out" }));
          ScrollTrigger.create({
            start: 0,
            end: "max",
            onUpdate: (self) => {
              const v = gsap.utils.clamp(-max, max, self.getVelocity() / -320);
              setters.forEach((set) => set(v));
            },
          });
        }
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
