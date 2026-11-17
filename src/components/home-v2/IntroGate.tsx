"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { buzz } from "./buzz";
import { looksLikeM, type Pt } from "./recognizeM";

type Props = {
  /** Called the moment the M is recognised, with the drawing's centre (viewport px): the reveal zooms out from there. */
  onTuned: (at: Pt) => void;
  /** Called when the gate has finished its exit and can be removed. */
  onGone: () => void;
};

const EMBER = "#ffb347";

/**
 * The intro: a dead TV channel. Visitors draw an M (mouse drag or finger) to tune in. Static calms down while
 * they draw; a recognised M flares, the screen flashes like a channel change and the page zooms out behind it.
 * Keyboard: press M. Anyone can skip.
 */
export function IntroGate({ onTuned, onGone }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const noiseCanvas = useRef<HTMLCanvasElement>(null);
  const inkCanvas = useRef<HTMLCanvasElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const [fails, setFails] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [touch, setTouch] = useState(false);
  const done = useRef(false);
  // Shared with the render loop.
  const state = useRef({
    strokes: [] as Pt[][],
    drawing: false,
    calm: 0,
    inkAlpha: 1,
    tuned: false,
  });

  useEffect(() => setTouch(matchMedia("(pointer: coarse)").matches), []);

  // Static + ink render loop.
  useEffect(() => {
    const nc = noiseCanvas.current!;
    const ic = inkCanvas.current!;
    const n = nc.getContext("2d", { alpha: false })!;
    const ink = ic.getContext("2d")!;
    const S = state.current;

    // A few pre-baked noise tiles, drawn at random offsets: looks like live static, costs almost nothing.
    const tiles = Array.from({ length: 5 }, () => {
      const c = document.createElement("canvas");
      c.width = c.height = 192;
      const x = c.getContext("2d")!;
      const img = x.createImageData(192, 192);
      const d = new Uint32Array(img.data.buffer);
      for (let i = 0; i < d.length; i++) {
        const v = (Math.random() * 255) | 0;
        d[i] = 0xff000000 | (v << 16) | (v << 8) | v;
      }
      x.putImageData(img, 0, 0);
      return n.createPattern(c, "repeat")!;
    });

    let dpr = 1;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      // Static renders at 1/2 CSS resolution and is scaled up with crisp pixels: chunkier grain, a quarter of the work.
      nc.width = Math.ceil(innerWidth / 2);
      nc.height = Math.ceil(innerHeight / 2);
      ic.width = Math.round(innerWidth * dpr);
      ic.height = Math.round(innerHeight * dpr);
    };
    resize();
    addEventListener("resize", resize);

    let raf = 0;
    let frame = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      frame++;
      // Static: random tile, random offset, every other frame (≈30 fps, like real snow).
      if (frame % 2 === 0) {
        const p = tiles[(Math.random() * tiles.length) | 0];
        n.save();
        n.translate(-Math.random() * 192, -Math.random() * 192);
        n.fillStyle = p;
        n.fillRect(0, 0, nc.width + 192, nc.height + 192);
        n.restore();
        // Calm the static as the drawing grows: the channel is "tuning in".
        n.fillStyle = `rgba(8,4,2,${0.35 + S.calm * 0.45})`;
        n.fillRect(0, 0, nc.width, nc.height);
        if (S.calm > 0.05) {
          n.fillStyle = `rgba(255,106,26,${S.calm * 0.12})`;
          n.fillRect(0, 0, nc.width, nc.height);
        }
        // Horizontal tear bands.
        for (let i = 0; i < 3; i++) {
          if (Math.random() < 0.5) continue;
          n.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.35)";
          n.fillRect(0, Math.random() * nc.height, nc.width, 1 + Math.random() * 6);
        }
      }

      // Ink.
      ink.setTransform(dpr, 0, 0, dpr, 0, 0);
      ink.clearRect(0, 0, innerWidth, innerHeight);
      if (!S.strokes.length) return;
      ink.globalAlpha = S.inkAlpha;
      ink.lineCap = ink.lineJoin = "round";
      for (const pass of [
        { w: 18, c: "rgba(255,106,26,0.18)", blur: 30 },
        { w: 7, c: EMBER, blur: 16 },
        { w: 2.5, c: "#fff6e8", blur: 0 },
      ]) {
        ink.lineWidth = pass.w;
        ink.strokeStyle = pass.c;
        ink.shadowColor = "#ff6a1a";
        ink.shadowBlur = pass.blur;
        for (const s of S.strokes) {
          if (s.length < 2) continue;
          ink.beginPath();
          ink.moveTo(s[0].x, s[0].y);
          for (let i = 1; i < s.length - 1; i++) {
            const mx = (s[i].x + s[i + 1].x) / 2;
            const my = (s[i].y + s[i + 1].y) / 2;
            ink.quadraticCurveTo(s[i].x, s[i].y, mx, my);
          }
          ink.lineTo(s[s.length - 1].x, s[s.length - 1].y);
          ink.stroke();
        }
      }
      ink.globalAlpha = 1;
      ink.shadowBlur = 0;
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, []);

  // Scroll is locked while the gate is up.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  const tuneIn = (at: Pt) => {
    if (done.current) return;
    done.current = true;
    state.current.tuned = true;
    try {
      sessionStorage.setItem("mt-tuned", "1");
    } catch {}
    buzz(18);
    // iOS asks once for motion access; the M is a user gesture, so ask now (the phone layout tilts with the device).
    const DOE = (
      globalThis as unknown as {
        DeviceOrientationEvent?: { requestPermission?: () => Promise<string> };
      }
    ).DeviceOrientationEvent;
    DOE?.requestPermission?.().catch(() => {});
    onTuned(at);
    const S = state.current;
    gsap
      .timeline({ onComplete: onGone })
      .to(S, { calm: 1, duration: 0.25, ease: "power2.out" })
      .to(
        inkCanvas.current,
        {
          scale: 1.08,
          duration: 0.25,
          ease: "power2.out",
          transformOrigin: `${at.x}px ${at.y}px`,
        },
        0,
      )
      .to(flash.current, { opacity: 0.9, duration: 0.08, ease: "none" }, 0.22)
      .to(flash.current, { opacity: 0, duration: 0.45, ease: "power2.out" }, 0.3)
      // Old-CRT channel change: the picture collapses to a bright line, then the new channel opens behind it.
      .to(
        "[data-gate-screen]",
        {
          scaleY: 0.004,
          duration: 0.32,
          ease: "power4.in",
          transformOrigin: `50% ${at.y}px`,
        },
        0.26,
      )
      .to(inkCanvas.current, { scale: 7, opacity: 0, duration: 0.9, ease: "power3.in" }, 0.3)
      .to("[data-gate-screen]", { scaleX: 0, opacity: 0, duration: 0.25, ease: "power3.in" }, 0.58)
      .to(root.current, { backgroundColor: "rgba(0,0,0,0)", duration: 0.5, ease: "power2.out" }, 0.55)
      .set(root.current, { pointerEvents: "none" }, 0.55)
      .to("[data-gate-osd]", { opacity: 0, duration: 0.2 }, 0.2);
  };

  const fail = () => {
    const next = fails + 1;
    setFails(next);
    setHint(next >= 2 ? "One stroke works best: up, down, up, down." : "Almost. Give it another go.");
    buzz([10, 40, 10]);
    gsap.fromTo("[data-gate-prompt]", { x: -10 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    const S = state.current;
    gsap.to(S, {
      inkAlpha: 0,
      calm: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        S.strokes = [];
        S.inkAlpha = 1;
      },
    });
  };

  // Drawing input.
  useEffect(() => {
    const el = root.current!;
    const S = state.current;
    let judge = 0;
    let travelled = 0;

    const centre = () => {
      const pts = S.strokes.flat();
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      return {
        x: (Math.min(...xs) + Math.max(...xs)) / 2,
        y: (Math.min(...ys) + Math.max(...ys)) / 2,
      };
    };

    const down = (e: PointerEvent) => {
      if (done.current || (e.target as HTMLElement).closest("button")) return;
      clearTimeout(judge);
      gsap.killTweensOf(S);
      S.inkAlpha = 1;
      S.drawing = true;
      S.strokes.push([{ x: e.clientX, y: e.clientY }]);
      el.setPointerCapture(e.pointerId);
      setHint(null);
    };
    const move = (e: PointerEvent) => {
      if (!S.drawing) return;
      const s = S.strokes[S.strokes.length - 1];
      const last = s[s.length - 1];
      const d = Math.hypot(e.clientX - last.x, e.clientY - last.y);
      if (d < 2) return;
      s.push({ x: e.clientX, y: e.clientY });
      travelled += d;
      S.calm = Math.min(0.75, travelled / 1400);
    };
    const up = () => {
      if (!S.drawing) return;
      S.drawing = false;
      // Recognise straight away when it's clearly an M; otherwise wait a beat in case another stroke follows.
      if (looksLikeM(S.strokes)) return tuneIn(centre());
      judge = window.setTimeout(() => {
        travelled = 0;
        if (looksLikeM(S.strokes)) tuneIn(centre());
        else fail();
      }, 650);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") tuneIn({ x: innerWidth / 2, y: innerHeight / 2 });
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    addEventListener("keydown", key);
    return () => {
      clearTimeout(judge);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      removeEventListener("keydown", key);
    };
    // tuneIn / fail read the latest state through refs and setters; re-binding on every fail count is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fails]);

  const skip = () => tuneIn({ x: innerWidth / 2, y: innerHeight / 2 });

  return (
    <div
      ref={root}
      data-intro-gate
      role="dialog"
      aria-modal="true"
      aria-label="Intro: draw the letter M to enter the site"
      className="fixed inset-0 z-[120] cursor-crosshair touch-none select-none overflow-hidden bg-black text-white"
    >
      <div data-gate-screen className="absolute inset-0">
        <canvas ref={noiseCanvas} aria-hidden className="absolute inset-0 size-full [image-rendering:pixelated]" />
        {/* Scanlines, a slow rolling bar and the tube's vignette. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,.28)_0_1px,transparent_1px_3px)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-[22vh] bg-gradient-to-b from-transparent via-white/[0.07] to-transparent motion-safe:animate-[tv-roll_5.5s_linear_infinite]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_55%,rgba(0,0,0,.85))]"
        />

        {/* Ghost M: a faint guide with a pen dot tracing it. */}
        <svg
          aria-hidden
          viewBox="0 0 100 80"
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(58vw,40vh,340px)] -translate-x-1/2 -translate-y-[58%] overflow-visible"
        >
          <path
            id="gate-m"
            d="M8 76 L8 6 L50 52 L92 6 L92 76"
            fill="none"
            stroke="rgba(255,179,71,.28)"
            strokeWidth="1.6"
            strokeDasharray="3 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle r="2.6" fill={EMBER} style={{ filter: "drop-shadow(0 0 4px #ff6a1a)" }}>
            <animateMotion dur="2.8s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.75;1" calcMode="linear">
              <mpath href="#gate-m" />
            </animateMotion>
          </circle>
        </svg>
      </div>

      <canvas ref={inkCanvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      <div ref={flash} aria-hidden className="pointer-events-none absolute inset-0 bg-white opacity-0" />

      {/* On-screen display, old-TV style. */}
      <div data-gate-osd className="pointer-events-none absolute inset-0 font-mono uppercase">
        <div className="absolute left-5 top-5 flex items-center gap-2 text-[0.7rem] tracking-[0.25em] text-white/80 sm:left-8 sm:top-7 sm:text-xs">
          <span className="size-2 rounded-full bg-[#ff3b1a] motion-safe:animate-[osd-blink_1.1s_steps(2)_infinite]" />
          No signal
        </div>
        <div className="absolute right-5 top-5 text-[0.7rem] tracking-[0.25em] text-[#7CFF8A] [text-shadow:0_0_8px_rgba(124,255,138,.6)] sm:right-8 sm:top-7 sm:text-xs">
          CH 03 · MT
        </div>
        <div data-gate-prompt className="absolute inset-x-0 bottom-[16vh] px-6 text-center sm:bottom-[14vh]">
          <p className="text-[clamp(1.1rem,0.8rem+1.6vw,2rem)] font-semibold tracking-[0.18em] text-white [text-shadow:0_0_18px_rgba(255,106,26,.55)]">
            Draw an <span className="text-[#FE9004]">M</span> to tune in
          </p>
          <p aria-live="polite" className="mt-3 min-h-[1.2em] text-[0.68rem] tracking-[0.22em] text-white/60 sm:text-xs">
            {hint ?? (touch ? "Use your finger, anywhere on the screen" : "Click and drag, anywhere on the screen · or press M")}
          </p>
        </div>
      </div>

      <div
        data-gate-osd
        className="absolute inset-x-0 bottom-6 flex justify-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] sm:bottom-8"
      >
        {fails >= 3 ? (
          <button
            type="button"
            onClick={skip}
            className="rounded-full border border-[#FE9004]/70 bg-[#FE9004]/15 px-5 py-2.5 text-white transition hover:bg-[#FE9004]/30"
          >
            Tune in anyway →
          </button>
        ) : (
          <button
            type="button"
            onClick={skip}
            className="px-3 py-2 text-white/45 underline-offset-4 transition hover:text-white hover:underline"
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}
