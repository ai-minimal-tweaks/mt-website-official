"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import type { EnquiryKind } from "@/content/contact";
import { forms } from "@/content/home-v2";

/** How long the celebration stays before the spell takes it away (ms). */
const SHOW_MS = 6200;

const INK = "#0b0b0b";
const CREAM = "#fff1e3";
const EMBER = "#FE9004";
const FLAME = "#ff6a1a";
const STICKER = { filter: `drop-shadow(4px 5px 0 ${FLAME})` };

/* ────────────────────────────────────────────────────────── particles (sparks in, spell out) */

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  hue: string;
  star: boolean;
  spin: number;
};
const HUES = ["#fff6e0", "#ffd29a", "#ffb347", EMBER, FLAME, "#ffffff"];

function useSparks(ready: boolean) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sparks = useRef<Spark[]>([]);
  useEffect(() => {
    const c = canvas.current;
    if (!ready || !c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const size = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
    };
    size();
    addEventListener("resize", size);
    let t = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      t += 1 / 60;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = "lighter";
      const list = sparks.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life++;
        if (p.life > p.max) {
          list.splice(i, 1);
          continue;
        }
        // Magic drift: float upward and curl like smoke from a wand.
        p.vx += Math.sin(t * 3 + p.y * 0.02) * 0.06;
        p.vy -= 0.035;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        const k = 1 - p.life / p.max;
        ctx.globalAlpha = Math.min(1, k * 1.6);
        ctx.fillStyle = p.hue;
        if (p.star) {
          const r = p.size * (0.6 + 0.4 * Math.sin(p.life * 0.35 + p.spin));
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.spin + p.life * 0.05);
          ctx.beginPath();
          for (let j = 0; j < 8; j++) {
            const rr = j % 2 ? r * 0.22 : r;
            const a = (j / 8) * Math.PI * 2;
            ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * k + 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    };
  }, [ready]);

  const emit = (x: number, y: number, n: number, opts: { speed?: number; up?: number; spread?: number } = {}) => {
    const { speed = 3, up = 0, spread = Math.PI * 2 } = opts;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      const v = speed * (0.3 + Math.random());
      sparks.current.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - up,
        life: 0,
        max: 40 + Math.random() * 60,
        size: 1 + Math.random() * 3.2,
        hue: HUES[(Math.random() * HUES.length) | 0],
        star: Math.random() < 0.35,
        spin: Math.random() * 6,
      });
    }
  };
  return { canvas, emit };
}

/* ────────────────────────────────────────────────────────── the stickers */

function Laptop({ title }: { title: string }) {
  return (
    <svg viewBox="0 0 160 112" className="w-full overflow-visible" style={STICKER} aria-hidden>
      <rect x="22" y="6" width="116" height="78" rx="8" fill={INK} stroke={CREAM} strokeWidth="4" />
      <rect x="30" y="14" width="100" height="62" rx="3" fill="#1b0b04" />
      {/* typing on screen */}
      <clipPath id="ss-type">
        <rect data-ss-type x="34" y="28" width="0" height="34" />
      </clipPath>
      <g clipPath="url(#ss-type)" fontFamily="ui-monospace, Menlo, monospace" fontWeight="700">
        <text x="36" y="40" fontSize="11" fill={EMBER}>
          &gt; {title.toLowerCase().slice(0, 14)}
        </text>
        <text x="36" y="56" fontSize="11" fill={CREAM}>
          &gt; we&apos;re on it ✦
        </text>
      </g>
      <rect data-ss-caret x="36" y="60" width="6" height="2.5" fill={EMBER} />
      <path d="M4 88h152l-10 16H14Z" fill={CREAM} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <rect x="66" y="88" width="28" height="5" rx="2" fill={INK} />
    </svg>
  );
}

function Notebook() {
  return (
    <svg viewBox="0 0 130 130" className="w-full overflow-visible" style={STICKER} aria-hidden>
      <g transform="rotate(-6 65 65)">
        <rect x="18" y="10" width="92" height="112" rx="8" fill={CREAM} stroke={INK} strokeWidth="4" />
        {[34, 50, 66, 82, 98].map((y) => (
          <line key={y} x1="34" x2="98" y1={y} y2={y} stroke="#e7cdb3" strokeWidth="2" />
        ))}
        {[22, 42, 62, 82, 102].map((y) => (
          <circle key={y} cx="18" cy={y} r="6" fill="none" stroke={INK} strokeWidth="3.5" />
        ))}
        <path
          data-ss-scribble
          d="M36 44c8-10 14 8 22-2s12 6 20-4 10 4 16-2M36 72c10-6 16 6 26-2s14 4 24-2"
          fill="none"
          stroke={FLAME}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="220"
          strokeDashoffset="220"
        />
      </g>
      {/* the pen, scribbling */}
      <g data-ss-pen>
        <g transform="translate(92 34) rotate(35)">
          <rect x="-6" y="-56" width="12" height="52" rx="5" fill={EMBER} stroke={INK} strokeWidth="3.5" />
          <rect x="-6" y="-56" width="12" height="12" rx="4" fill={INK} />
          <path d="M-6-4h12L0 10Z" fill={CREAM} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}

function Camera() {
  return (
    <svg viewBox="0 0 150 112" className="w-full overflow-visible" style={STICKER} aria-hidden>
      <path d="M44 22l8-12h34l8 12" fill={CREAM} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <rect x="8" y="22" width="134" height="82" rx="14" fill={CREAM} stroke={INK} strokeWidth="4" />
      <rect x="18" y="30" width="22" height="12" rx="3" fill={EMBER} stroke={INK} strokeWidth="3" />
      <circle cx="75" cy="63" r="30" fill={INK} stroke={INK} strokeWidth="4" />
      <circle cx="75" cy="63" r="21" fill="#2a1206" stroke={EMBER} strokeWidth="4" />
      <circle cx="68" cy="56" r="6" fill="#fff" opacity=".85" />
      <circle cx="122" cy="38" r="5" fill={FLAME} stroke={INK} strokeWidth="3" />
      <circle data-ss-flash cx="122" cy="38" r="26" fill="#fff" opacity="0" />
    </svg>
  );
}

function Lens() {
  return (
    <svg viewBox="0 0 110 110" className="w-full overflow-visible" style={STICKER} aria-hidden>
      <circle cx="55" cy="55" r="48" fill={CREAM} stroke={INK} strokeWidth="4" />
      <circle cx="55" cy="55" r="36" fill={INK} />
      <g data-ss-aperture>
        {Array.from({ length: 6 }, (_, i) => (
          <path
            key={i}
            d="M55 55 L55 21 A34 34 0 0 1 84 38 Z"
            fill={i % 2 ? "#3a1406" : "#5a230a"}
            transform={`rotate(${i * 60} 55 55)`}
          />
        ))}
        <circle cx="55" cy="55" r="12" fill="#120602" stroke={EMBER} strokeWidth="2.5" />
      </g>
      <path
        data-ss-glint
        d="M30 40a30 30 0 0 1 20-16"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".85"
      />
      {Array.from({ length: 24 }, (_, i) => (
        <line key={i} x1="55" y1="8" x2="55" y2="13" stroke={INK} strokeWidth="2" transform={`rotate(${i * 15} 55 55)`} />
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────── scene */

/**
 * Thank-you moment for both homepage forms. The panel floods with molten ember "water", the studio kit
 * (laptop, notebook + pen, camera, lens) bursts out as stickers and keeps doing its thing, the message
 * waves in. After ~6s a wand-streak sweeps the panel and it dissolves into rising sparks, then closes.
 */
export function SuccessScene({
  kind,
  panel,
  backdrop,
  onDone,
}: {
  kind: EnquiryKind;
  panel: React.RefObject<HTMLDivElement | null>;
  backdrop: () => Element | null;
  onDone: () => void;
}) {
  const copy = forms[kind].done;
  const root = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { canvas, emit } = useSparks(mounted);
  const vanishing = useRef(false);

  const vanish = () => {
    if (vanishing.current) return;
    vanishing.current = true;
    const el = panel.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to([el, backdrop()], { opacity: 0, duration: 0.4, onComplete: onDone });
      return;
    }
    const r = el.getBoundingClientRect();
    const state = { d: -18, wand: 0 };
    const mask = (v: string) => {
      el.style.maskImage = v;
      el.style.setProperty("-webkit-mask-image", v);
    };
    gsap
      .timeline({ onComplete: onDone })
      // 1. The wand flick: a streak of light whips across the panel.
      .to(state, {
        wand: 1,
        duration: 0.45,
        ease: "power2.in",
        onUpdate: () => {
          const x = r.left + r.width * state.wand;
          const y = r.top + r.height * (0.15 + 0.7 * Math.sin(state.wand * Math.PI) * 0.6);
          emit(x, y, 6, { speed: 2.5, spread: Math.PI * 2 });
        },
      })
      .set("[data-ss-wand]", { opacity: 1 }, 0)
      .to("[data-ss-wand-clip]", { attr: { width: 120 }, duration: 0.45, ease: "power2.in" }, 0)
      .to("[data-ss-wand]", { opacity: 0, duration: 0.3 }, 0.45)
      // 2. The panel disintegrates left → right into rising sparks.
      .to(
        state,
        {
          d: 112,
          duration: 1.25,
          ease: "power1.inOut",
          onUpdate: () => {
            mask(`linear-gradient(100deg, transparent ${state.d}%, #000 ${state.d + 14}%)`);
            const fx = r.left + (r.width * (state.d + 7)) / 100;
            if (fx > r.left - 10 && fx < r.right + 10)
              for (let i = 0; i < 9; i++)
                emit(fx + (Math.random() - 0.5) * 30, r.top + Math.random() * r.height, 1, { speed: 2.2, up: 0.6, spread: 1.8 });
          },
        },
        0.4,
      )
      .to(el, { scale: 0.97, rotate: -0.6, duration: 1.25, ease: "power1.in" }, 0.4)
      .to(backdrop(), { opacity: 0, duration: 0.9, ease: "power2.in" }, 0.9)
      .to({}, { duration: 0.7 }); // let the last sparks rise before unmounting
  };

  useEffect(() => {
    const el = root.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduce) return;
      const r = el.getBoundingClientRect();
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      // Liquid in: the whole scene ripples like it's settling under water.
      tl.fromTo("[data-ss-ripple]", { attr: { scale: 90 } }, { attr: { scale: 0 }, duration: 1.8, ease: "power3.out" }, 0)
        .fromTo(
          "[data-ss-ripple-noise]",
          { attr: { baseFrequency: "0.02 0.06" } },
          { attr: { baseFrequency: "0.004 0.01" }, duration: 1.8 },
          0,
        )
        .fromTo("[data-ss-water]", { yPercent: 100 }, { yPercent: 0, duration: 1.6, ease: "power3.out" }, 0)
        .from(
          "[data-ss-item]",
          {
            scale: 0,
            rotate: () => gsap.utils.random(-40, 40),
            x: (i, t: HTMLElement) => r.width / 2 - (t.offsetLeft + t.offsetWidth / 2),
            y: (i, t: HTMLElement) => r.height / 2 - (t.offsetTop + t.offsetHeight / 2),
            duration: 1.3,
            stagger: 0.09,
            ease: "back.out(1.6)",
          },
          0.25,
        )
        .from("[data-ss-word]", { yPercent: 120, rotate: 8, opacity: 0, duration: 0.9, stagger: 0.05 }, 0.45)
        .from("[data-ss-body]", { y: 20, opacity: 0, duration: 0.9 }, 0.85)
        .from(
          "[data-ss-tag]",
          { scale: 0, rotate: () => gsap.utils.random(-25, 25), duration: 0.8, stagger: 0.12, ease: "back.out(2.5)" },
          1.1,
        )
        .call(() => emit(r.left + r.width / 2, r.top + r.height * 0.42, 70, { speed: 7 }), [], 0.35)
        // Still water: drop the filter so text renders crisp.
        .set("[data-ss-liquid]", { filter: "none" }, 1.9);

      // Living props.
      gsap.to("[data-ss-type]", { attr: { width: 96 }, duration: 1.6, ease: "steps(26)", delay: 0.9 });
      gsap.to("[data-ss-caret]", { opacity: 0, duration: 0.45, repeat: -1, yoyo: true, ease: "steps(1)" });
      gsap.fromTo(
        "[data-ss-scribble]",
        { strokeDashoffset: 220 },
        { strokeDashoffset: 0, duration: 2.2, ease: "none", repeat: -1, repeatDelay: 0.5, delay: 0.9 },
      );
      gsap.to("[data-ss-pen]", { x: -26, y: 22, duration: 0.55, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.9 });
      gsap.to("[data-ss-aperture]", { rotation: 360, svgOrigin: "55 55", duration: 6, ease: "none", repeat: -1 });
      gsap.to("[data-ss-word]", {
        y: -6,
        duration: 0.9,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.08, from: "start" },
        delay: 1.4,
      });
      const flash = () => {
        gsap.fromTo(
          "[data-ss-flash]",
          { opacity: 0.95, attr: { r: 8 } },
          { opacity: 0, attr: { r: 70 }, duration: 0.6, ease: "power2.out" },
        );
        const cam = el.querySelector("[data-ss-cam]")?.getBoundingClientRect();
        if (cam) emit(cam.right - cam.width * 0.18, cam.top + cam.height * 0.34, 18, { speed: 4 });
      };
      gsap.delayedCall(1.7, flash);
      gsap.delayedCall(4.2, flash);
      // Countdown bar drains, then the spell.
      gsap.fromTo("[data-ss-timer]", { scaleX: 1 }, { scaleX: 0, duration: SHOW_MS / 1000, ease: "none" });
    }, el);
    const t = setTimeout(vanish, SHOW_MS);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={root}
      role="status"
      aria-live="polite"
      className="relative isolate min-h-[min(36rem,calc(100svh-2rem))] flex-1 overflow-hidden bg-ink text-white"
    >
      {/* Sparks live above everything (outside the panel, which gets masked away during the spell). */}
      {mounted &&
        createPortal(
          <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[130] size-full" />,
          document.body,
        )}

      {/* Liquid filter: turbulence-driven displacement, animated from churning to still. */}
      <svg aria-hidden className="absolute size-0">
        <filter id="ss-liquid" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence data-ss-ripple-noise type="fractalNoise" baseFrequency="0.004 0.01" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap data-ss-ripple in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div data-ss-liquid className="absolute inset-0 [filter:url(#ss-liquid)]">
        {/* Molten ember water with two endlessly flowing wave layers. */}
        <div data-ss-water className="absolute inset-x-0 bottom-0 h-[46%]">
          {[
            { c: "rgba(194,65,12,.55)", d: "9s", o: "0" },
            { c: "rgba(255,106,26,.75)", d: "6s", o: "-3s" },
          ].map((w, i) => (
            <svg
              key={i}
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="absolute -top-[34px] left-0 h-[70px] w-[200%] animate-[ss-wave_linear_infinite]"
              style={{ animationDuration: w.d, animationDelay: w.o, top: i ? -22 : -40 }}
              aria-hidden
            >
              <path d="M0 60 Q150 0 300 60 T600 60 T900 60 T1200 60 V120 H0Z" fill={w.c} />
            </svg>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff6a1a]/75 via-[#c2410c]/80 to-[#3a1406]" />
          {/* bubbles */}
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className="absolute bottom-0 rounded-full border border-white/40 bg-white/10 motion-safe:animate-[ss-bubble_ease-in_infinite]"
              style={{
                left: `${6 + i * 9.3}%`,
                width: 6 + (i % 4) * 4,
                height: 6 + (i % 4) * 4,
                animationDuration: `${3 + (i % 5) * 0.7}s`,
                animationDelay: `${(i * 0.37) % 2.5}s`,
              }}
            />
          ))}
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,rgba(255,179,71,.18),transparent_70%)]"
        />

        {/* The studio kit */}
        <div data-ss-item className="absolute left-[5%] top-[7%] w-[30%] max-w-[13rem]">
          <div className="motion-safe:animate-[ss-bob_4.2s_ease-in-out_infinite]">
            <Laptop title={copy.title} />
          </div>
        </div>
        <div data-ss-item className="absolute right-[5%] top-[5%] w-[24%] max-w-[10rem]">
          <div className="motion-safe:animate-[ss-bob_3.6s_ease-in-out_infinite_.4s]">
            <Notebook />
          </div>
        </div>
        <div data-ss-item data-ss-cam className="absolute bottom-[7%] left-[6%] w-[27%] max-w-[11rem]">
          <div className="motion-safe:animate-[ss-bob_3.9s_ease-in-out_infinite_.8s]">
            <Camera />
          </div>
        </div>
        <div data-ss-item className="absolute bottom-[8%] right-[7%] w-[21%] max-w-[8.5rem]">
          <div className="motion-safe:animate-[ss-bob_4.6s_ease-in-out_infinite_.2s]">
            <Lens />
          </div>
        </div>

        {/* The message */}
        <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-8 text-center">
          <h2 id="enquiry-title" className="text-[clamp(2.1rem,1.4rem+3vw,3.4rem)] font-bold leading-[0.95] tracking-[-0.05em]">
            {copy.title.split(" ").map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <span data-ss-word className={`inline-block ${i === copy.title.split(" ").length - 1 ? "text-[#FE9004]" : ""}`}>
                  {w}&nbsp;
                </span>
              </span>
            ))}
          </h2>
          <p data-ss-body className="mx-auto mt-4 max-w-[22rem] text-[1.02rem] leading-snug text-white/85">
            {copy.body}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {copy.tags.map((t, i) => (
              <span
                key={t}
                data-ss-tag
                className={`rounded-full border-2 border-ink px-3 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-[0.08em] text-ink shadow-[3px_3px_0_#ff6a1a] ${["bg-[#fff1e3]", "bg-[#ffb347]", "bg-[#7CFF8A]"][i % 3]}`}
                style={{ rotate: `${[-4, 3, -2][i % 3]}deg` }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Wand streak (drawn during the vanish) */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-20 size-full"
      >
        <clipPath id="ss-wand-clip">
          <rect data-ss-wand-clip x="-10" y="-10" width="0" height="120" />
        </clipPath>
        <path
          data-ss-wand
          d="M-5 85 C 25 20, 60 10, 105 30"
          fill="none"
          stroke="#fff6e0"
          strokeWidth="1.4"
          strokeLinecap="round"
          clipPath="url(#ss-wand-clip)"
          opacity="0"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 6px #ffb347) drop-shadow(0 0 14px #ff6a1a)" }}
        />
      </svg>

      {/* countdown + skip */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-white/10">
        <div data-ss-timer className="h-full origin-left bg-gradient-to-r from-[#ffb347] to-[#ff6a1a]" />
      </div>
      <button
        type="button"
        onClick={vanish}
        aria-label="Close"
        className="absolute right-4 top-4 z-30 grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:rotate-90 hover:bg-white hover:text-ink sm:right-6 sm:top-6"
      >
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
          <path d="M3.5 3.5l9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
