"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { buzz } from "./buzz";
import { LogoLockup } from "@/components/ui";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";

/** Text that decodes out of random glyphs, on reveal and again whenever it's hovered. */
export function ScrambleText({ text, play, className = "" }: { text: string; play: boolean; className?: string }) {
  const [out, setOut] = useState(text);
  const raf = useRef(0);

  const run = () => {
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const fixed = Math.floor(p * text.length);
      setOut(Array.from(text, (ch, i) => (i < fixed || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(""));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (play) run();
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, text]);

  return (
    <span className={className} onPointerEnter={run} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}

export function TopBar({ tagline, play, compact = false }: { tagline: string; play: boolean; compact?: boolean }) {
  return (
    <header
      data-rise="down"
      className={`relative flex items-center justify-between overflow-hidden bg-[#fdf1e6] ${compact ? "h-16 rounded-[1.25rem] px-5" : "h-[5.25rem] rounded-[1.1rem] px-[5%]"}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--bx", `${e.clientX - r.left}px`);
      }}
    >
      {/* A warm light that slides along the bar under the cursor. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-64 bg-[radial-gradient(closest-side,rgba(255,179,71,.35),transparent)] transition-transform duration-300 ease-out [transform:translateX(calc(var(--bx,-20rem)-50%))]"
      />
      <a href="/" className="relative flex items-center text-[#1A1A1A]" aria-label="Minimal Tweaks home">
        <LogoLockup className={compact ? "h-9 w-auto" : "h-[2.6rem] w-auto lg:h-[2.9rem]"} />
      </a>
      <ScrambleText
        text={compact ? "Gurugram" : tagline}
        play={play}
        className={`relative font-medium uppercase text-ink/60 ${compact ? "text-[0.7rem] tracking-[0.18em]" : "hidden text-[1.15rem] tracking-[0.08em] sm:block"}`}
      />
    </header>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={`size-5 ${className}`}>
      <path
        d="M3 10h13M11 4.5 16.5 10 11 15.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Hero call to action: frosted ("glass") or ember-filled; leans toward the cursor and sweeps a sheen on hover. */
export function CtaButton({
  variant,
  children,
  onClick,
}: {
  variant: "glass" | "ember";
  children: React.ReactNode;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (!matchMedia("(pointer: fine)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.18);
      y((e.clientY - (r.top + r.height / 2)) * 0.3);
    };
    const leave = () => (x(0), y(0));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`cta-shimmer group relative flex h-[4.6rem] w-full min-w-[19rem] items-center justify-between gap-8 overflow-hidden rounded-[0.9rem] border px-8 text-[1.3rem] font-bold uppercase tracking-[-0.035em] text-white backdrop-blur-md transition-[border-color,box-shadow] duration-300 ${
        variant === "glass"
          ? "border-white/45 bg-white/[0.07] hover:border-white/80 hover:shadow-[0_0_40px_-8px_rgba(255,255,255,.35)]"
          : "border-[#ffb347]/80 bg-gradient-to-r from-[#3a1406]/90 via-[#a3400a]/90 to-[#ff7a1a]/95 hover:shadow-[0_0_50px_-6px_rgba(255,106,26,.75)]"
      }`}
    >
      <span className="relative">{children}</span>
      <ArrowRight className="relative size-6 transition-transform duration-300 group-hover:translate-x-1.5" />
    </button>
  );
}

/** Chunky "arcade" button for the phone layout: it physically presses down and buzzes. */
export function ArcadeButton({
  variant,
  children,
  onClick,
}: {
  variant: "glass" | "ember";
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        buzz(14);
        onClick();
      }}
      className={`cta-shimmer group relative flex h-16 w-full items-center justify-between overflow-hidden rounded-2xl px-6 text-[1.05rem] font-bold uppercase tracking-[-0.02em] transition-[transform,box-shadow] duration-100 active:translate-y-[6px] ${
        variant === "ember"
          ? "bg-gradient-to-r from-[#ff6a1a] to-[#FE9004] text-ink shadow-[0_7px_0_#8a2c04,0_20px_40px_-12px_rgba(255,106,26,.7)] active:shadow-[0_1px_0_#8a2c04]"
          : "border border-white/40 bg-white/10 text-white backdrop-blur-md shadow-[0_7px_0_rgba(255,255,255,.18)] active:shadow-[0_1px_0_rgba(255,255,255,.18)]"
      }`}
    >
      <span className="relative">{children}</span>
      <ArrowRight className="relative" />
    </button>
  );
}
