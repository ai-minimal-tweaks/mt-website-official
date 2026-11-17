"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { buzz } from "./buzz";
import { GradientField } from "@/components/three/GradientField";
import { homeV2 } from "@/content/home-v2";
import type { EnquiryKind } from "@/content/contact";
import { site, socials } from "@/lib/site";
import { IntroGate } from "./IntroGate";
import { HeroHeadline } from "./HeroHeadline";
import { Subline } from "./Subline";
import { BrandsMarquee } from "./BrandsMarquee";
import { EnquiryModal } from "./EnquiryModal";
import { ArcadeButton, CtaButton, TopBar } from "./parts";
import type { Pt } from "./recognizeM";

type Phase = "gate" | "reveal" | "live";

/**
 * The v2 homepage experience: intro gate → zoom-out reveal → live page, with the two enquiry pop-ups.
 * Desktop/tablet (≥768px) is the single-screen design; phones get "channels" you swipe through like a TV.
 */
export function Experience() {
  const [phase, setPhase] = useState<Phase>("gate");
  const [gate, setGate] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [form, setForm] = useState<EnquiryKind | null>(null);
  const world = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mq = matchMedia("(max-width: 767px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    // Reduced motion: no gate, no zoom.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGate(false);
      setPhase("live");
    }
    return () => mq.removeEventListener("change", apply);
  }, []);

  const onTuned = (at: Pt) => {
    setPhase("reveal");
    const el = world.current!;
    gsap
      .timeline({ onComplete: () => setPhase("live") })
      // The page starts deep inside the M and pulls back, settling into place.
      .fromTo(
        el,
        {
          scale: 2.6,
          rotateX: 12,
          filter: "blur(18px) brightness(0.3) saturate(1.6)",
          transformOrigin: `${at.x}px ${at.y}px`,
          transformPerspective: 1600,
        },
        {
          scale: 1,
          rotateX: 0,
          filter: "blur(0px) brightness(1) saturate(1)",
          duration: 2,
          ease: "expo.out",
          clearProps: "transform,filter,transformOrigin",
        },
        0.32,
      )
      .from(el.querySelectorAll('[data-rise="down"]'), { y: -60, opacity: 0, duration: 1.2, ease: "expo.out" }, 0.9)
      .from(el.querySelectorAll('[data-rise="side"]'), { x: 80, opacity: 0, duration: 1.2, stagger: 0.12, ease: "expo.out" }, 1.1)
      .from(el.querySelectorAll('[data-rise="up"]'), { y: 50, opacity: 0, duration: 1.1, stagger: 0.1, ease: "expo.out" }, 1.2);
  };

  const play = phase !== "gate";
  const open = (k: EnquiryKind) => setForm(k);

  return (
    <>
      {/* Readable headline for search engines and screen readers; the visual one is canvas. */}
      <h1 className="sr-only">Creative work needs minimal tweaks. {homeV2.sub}</h1>
      <div ref={world}>{mobile ? <PhoneHome play={play} open={open} /> : <DesktopHome play={play} open={open} />}</div>
      {gate && <IntroGate onTuned={onTuned} onGone={() => setGate(false)} />}
      <EnquiryModal kind={form} stepped={mobile} onClose={() => setForm(null)} />
      {/* Without JavaScript there's nothing to draw with: show the page. */}
      <noscript>
        <style>{"[data-intro-gate]{display:none!important}"}</style>
      </noscript>
    </>
  );
}

/* ───────────────────────────────────────────────────────────── desktop / tablet */

function DesktopHome({ play, open }: { play: boolean; open: (k: EnquiryKind) => void }) {
  const hero = useRef<HTMLElement>(null);

  // The hero card turns gently toward the cursor and a spotlight follows it.
  useEffect(() => {
    const el = hero.current!;
    if (!matchMedia("(pointer: fine)").matches) return;
    const rx = gsap.quickTo(el, "rotationX", {
      duration: 0.9,
      ease: "power3.out",
    });
    const ry = gsap.quickTo(el, "rotationY", {
      duration: 0.9,
      ease: "power3.out",
    });
    gsap.set(el, { transformPerspective: 2200 });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--sx", `${px * 100}%`);
      el.style.setProperty("--sy", `${py * 100}%`);
      rx((0.5 - py) * 3);
      ry((px - 0.5) * 4);
    };
    const leave = () => (rx(0), ry(0));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-svh max-w-[110rem] flex-col gap-3 p-4 lg:h-svh lg:min-h-[46rem] lg:gap-4 lg:p-5">
      <TopBar tagline={homeV2.tagline} play={play} />

      <section
        ref={hero}
        aria-label="Introduction"
        className="relative isolate flex min-h-[26rem] flex-[1_1_0] items-center overflow-hidden rounded-[1.75rem] bg-ink text-white"
      >
        <GradientField priority />
        {/* Warmth to match the design: an orange sky on the right third, a red-brown middle, a low ember glow. Screen
            blend keeps the moving WebGL light visible underneath. Static CSS, so it costs nothing per frame. */}
        <div aria-hidden className="hero-warmth pointer-events-none absolute inset-0 mix-blend-screen" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(28rem_circle_at_var(--sx,70%)_var(--sy,40%),rgba(255,179,71,.16),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_25%_55%,rgba(0,0,0,.55),transparent_75%)]"
        />

        <div className="relative z-10 grid w-full items-end gap-10 px-[5%] py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
          <div className="min-w-0">
            <HeroHeadline layout="desktop" play={play} />
            {/* Tight line box (1.15) so its bottom sits on the descenders: the buttons' bottom edge lines up with the text. */}
            <p data-rise="up" className="mt-3 text-[clamp(1.05rem,0.7rem+0.8vw,1.6rem)] leading-[1.15] text-white/85">
              <Subline />
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <div data-rise="side">
              <CtaButton variant="glass" onClick={() => open("deck")}>
                {homeV2.ctas.deck}
              </CtaButton>
            </div>
            <div data-rise="side">
              <CtaButton variant="ember" onClick={() => open("project")}>
                {homeV2.ctas.project}
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      <section aria-label={homeV2.brandsLabel} className="flex shrink-0 flex-col">
        <h2
          data-rise="up"
          className="mt-1 text-center text-[clamp(.8rem,.6rem+.4vw,1.05rem)] font-medium uppercase tracking-[0.42em] text-ink/55"
        >
          <WaveText text={homeV2.brandsLabel} />
        </h2>
        <div data-rise="up" className="mt-3">
          <BrandsMarquee />
        </div>
      </section>

      <MiniFooter />
    </main>
  );
}

/** Letters that ripple upward under the cursor. */
function WaveText({ text }: { text: string }) {
  return (
    <span className="inline-flex" aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre transition-[transform,color] duration-300 ease-out hover:-translate-y-2 hover:text-[#FE9004]"
          onPointerEnter={(e) => gsap.fromTo(e.currentTarget, { y: -10 }, { y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" })}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

function MiniFooter({ dark = false }: { dark?: boolean }) {
  return (
    <footer
      data-rise="up"
      className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pb-1 text-[0.82rem] ${dark ? "" : "px-2"} ${dark ? "text-white/60" : "text-ink/50"}`}
    >
      <span>© {new Date().getFullYear()} Minimal Tweaks</span>
      <span className="flex flex-wrap gap-x-5 gap-y-1">
        <a className="transition hover:text-[#FE9004]" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        <a className="transition hover:text-[#FE9004]" href={`tel:${site.phones[0].replace(/[^+\d]/g, "")}`}>
          {site.phones[0]}
        </a>
        {socials.map((s) => (
          <a key={s.key} className="transition hover:text-[#FE9004]" href={s.href} target="_blank" rel="noopener noreferrer">
            {s.label}
          </a>
        ))}
      </span>
    </footer>
  );
}

/* ───────────────────────────────────────────────────────────── phones: "channels" */

function PhoneHome({ play, open }: { play: boolean; open: (k: EnquiryKind) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const zap = useRef<HTMLDivElement>(null);
  const [ch, setCh] = useState(0);

  // Changing channel: a burst of static and the on-screen channel number, like flicking a TV.
  useEffect(() => {
    const root = scroller.current!;
    const c = document.createElement("canvas");
    c.width = c.height = 80;
    const x = c.getContext("2d")!;
    const img = x.createImageData(80, 80);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data.set([v, v, v, 255], i);
    }
    x.putImageData(img, 0, 0);
    zap.current?.style.setProperty("--tv-noise", `url(${c.toDataURL()})`);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = Number((e.target as HTMLElement).dataset.channel);
          setCh((prev) => {
            if (prev !== i && zap.current) {
              gsap.fromTo(zap.current, { opacity: 0.55 }, { opacity: 0, duration: 0.35, ease: "power2.out" });
              buzz(6);
            }
            return i;
          });
        }),
      { root, threshold: 0.6 },
    );
    root.querySelectorAll("[data-channel]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Tilt the phone (or drag a finger) and the hero shifts in 3D.
  useEffect(() => {
    const el = hero.current!;
    const rx = gsap.quickTo(el, "rotationX", {
      duration: 0.8,
      ease: "power3.out",
    });
    const ry = gsap.quickTo(el, "rotationY", {
      duration: 0.8,
      ease: "power3.out",
    });
    gsap.set(el, { transformPerspective: 1000 });
    const orient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      rx(gsap.utils.clamp(-8, 8, (e.beta - 45) * -0.25));
      ry(gsap.utils.clamp(-8, 8, e.gamma * 0.3));
    };
    const touch = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--sx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--sy", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    addEventListener("deviceorientation", orient);
    el.addEventListener("pointermove", touch);
    el.addEventListener("pointerdown", touch);
    return () => {
      removeEventListener("deviceorientation", orient);
      el.removeEventListener("pointermove", touch);
      el.removeEventListener("pointerdown", touch);
    };
  }, []);

  return (
    <div
      ref={scroller}
      className="h-[100svh] snap-y snap-mandatory overflow-y-auto overscroll-none bg-white [scrollbar-width:none]"
    >
      {/* Static burst on channel change */}
      <div ref={zap} aria-hidden className="tv-zap pointer-events-none fixed inset-0 z-40 opacity-0" />

      {/* CH 01: the hero */}
      <section
        data-channel={0}
        aria-label="Introduction"
        className="flex h-[100svh] snap-start flex-col gap-3 px-3 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <TopBar tagline={homeV2.tagline} play={play} compact />
        <div
          ref={hero}
          className="relative isolate flex flex-1 flex-col justify-end overflow-hidden rounded-[1.25rem] bg-ink px-5 pb-[calc(1.25rem+7px)] text-white"
        >
          <GradientField priority />
          <div aria-hidden className="hero-warmth hero-warmth--portrait pointer-events-none absolute inset-0 mix-blend-screen" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(16rem_circle_at_var(--sx,70%)_var(--sy,30%),rgba(255,179,71,.22),transparent_70%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
          />
          <div className="relative z-10">
            <HeroHeadline layout="mobile" play={play} />
            <p data-rise="up" className="mt-2 text-[0.98rem] text-white/85">
              <Subline compact />
            </p>
            {/* 20px between buttons = 13px visible gap above the next button once the 7px press shadow is counted. */}
            <div className="mt-6 grid gap-5">
              <div data-rise="up">
                <ArcadeButton variant="ember" onClick={() => open("project")}>
                  {homeV2.ctas.project}
                </ArcadeButton>
              </div>
              <div data-rise="up">
                <ArcadeButton variant="glass" onClick={() => open("deck")}>
                  {homeV2.ctas.deck}
                </ArcadeButton>
              </div>
            </div>
          </div>
        </div>
        <SwipeHint />
      </section>

      {/* CH 02: brands */}
      <section
        data-channel={1}
        aria-label={homeV2.brandsLabel}
        className="relative flex h-[100svh] snap-start flex-col justify-center overflow-hidden bg-[#fdf1e6] py-10"
      >
        <p className="px-8 font-mono text-[0.68rem] uppercase tracking-[0.25em] text-ink/50">
          {String(homeV2.brands.length).padStart(2, "0")} brands unlocked · on loop
        </p>
        <h2 className="mt-3 px-8 text-[2.6rem] font-bold leading-[0.95] tracking-[-0.05em] text-ink">
          Brands we’ve <span className="text-[#ff6a1a]">tweaked</span>
        </h2>
        <div className="mt-8">
          <BrandsMarquee compact />
        </div>
      </section>

    </div>
  );
}

function SwipeHint() {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center gap-2 pb-[env(safe-area-inset-bottom)] font-mono text-[0.6rem] uppercase tracking-[0.25em] text-ink/45"
    >
      <span className="motion-safe:animate-[swipe-up_1.6s_ease-in-out_infinite]">↑</span> Swipe to see the brands
    </div>
  );
}
