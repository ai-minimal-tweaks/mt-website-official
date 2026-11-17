"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import TechText from "@/components/motion/TechText";
import { homeV2 } from "@/content/home-v2";

type Row =
  | { kind: "tech"; text: string; tone: "white" | "ember" }
  | { kind: "struck-tech"; struck: string; text: string }
  | { kind: "struck"; text: string };

const { lead, struck, accent } = homeV2.headline;
const DESKTOP: Row[] = [
  { kind: "tech", text: lead, tone: "white" },
  { kind: "struck-tech", struck, text: accent },
];
const MOBILE: Row[] = [
  { kind: "tech", text: "creative work", tone: "white" },
  { kind: "tech", text: "needs", tone: "white" },
  { kind: "struck", text: struck },
  { kind: "tech", text: "minimal", tone: "ember" },
  { kind: "tech", text: "tweaks", tone: "ember" },
];

const WEIGHT = 700;
const TRACK = -0.05; // em, same as TechText's letterSpacing
const TECH_MARGIN = 0.05; // TechText keeps 5% of its width as a left margin when aligned left

/** Ink width of `text` at 1px font size, in the page's sans font. */
function measure(text: string, family: string) {
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `${WEIGHT} 100px ${family}`;
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${TRACK * 100}px`;
  return ctx.measureText(text).width / 100;
}

/**
 * The hero headline. The big words are React Bits TechText canvases (type-on intro; letters can be pushed,
 * dragged and flicked with the cursor or a finger, with type-metric guides that light up nearby).
 * "a lot of" is real text struck through by an ember line. One font size is computed for every row so the
 * canvases line up like a single typeset headline.
 */
export function HeroHeadline({ layout, play }: { layout: "desktop" | "mobile"; play: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{
    font: number;
    width: number;
    strikeW: number;
  } | null>(null);
  const rows = layout === "desktop" ? DESKTOP : MOBILE;

  useLayoutEffect(() => {
    const el = box.current!;
    const fit = () => {
      const family = getComputedStyle(el).fontFamily;
      const W = el.clientWidth;
      const strikeW = measure(`${struck} `, family);
      // Font size where the widest row fills the box (TechText canvases need 10% horizontal breathing room).
      const perRow = rows.map((r) =>
        r.kind === "tech"
          ? (W * (1 - 2 * TECH_MARGIN)) / measure(r.text, family)
          : r.kind === "struck"
            ? (W * 0.9) / measure(r.text, family)
            : // "a lot of" sits in front of a TechText that needs its ink within 90% of the remaining width.
              (W * (1 - TECH_MARGIN) * 0.88) / (measure(r.text, family) + 0.9 * strikeW),
      );
      const font = Math.floor(Math.min(...perRow, layout === "desktop" ? 150 : 120));
      setSize({ font, width: W, strikeW: strikeW * font });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [layout, rows]);

  // The strike draws across once the type has landed.
  useEffect(() => {
    if (!play || !box.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-strike-line]", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut", delay: 1.25 });
      gsap.fromTo(
        "[data-struck-word]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.75 },
      );
    }, box);
    return () => ctx.revert();
  }, [play, size?.font]);

  const font = size?.font ?? 0;
  const W = size?.width ?? 0;
  const rowH = font * 1.32;
  const pad = W * TECH_MARGIN;

  const tech = (text: string, tone: "white" | "ember", width: number) => (
    <div style={{ width, height: rowH }} className={tone === "ember" ? "text-[#FE9004]" : "text-white"}>
      {play && (
        <TechText
          text={text}
          fontSize={font}
          fontWeight={WEIGHT}
          letterSpacing={TRACK}
          align="left"
          intro="type"
          introDuration={1.1}
          accentColor={tone === "ember" ? "#ffd29a" : "#FE9004"}
          reach={layout === "desktop" ? 220 : 140}
          labels={layout === "desktop"}
          specks={layout === "desktop" ? 15 : 8}
        />
      )}
    </div>
  );

  const struckWord = (text: string) => (
    <span
      data-struck-word
      className="relative inline-block whitespace-nowrap font-bold text-white/75 opacity-0"
      style={{ fontSize: font, letterSpacing: `${TRACK}em`, lineHeight: 1 }}
    >
      {text}
      <span
        data-strike-line
        aria-hidden
        className="absolute left-[-3%] top-[56%] h-[0.11em] w-[106%] origin-left -rotate-[4deg] scale-x-0 rounded-full bg-gradient-to-r from-[#7a1d05] via-[#ff6a1a] to-[#ffb347] shadow-[0_0_18px_rgba(255,106,26,.6)]"
      />
    </span>
  );

  return (
    // TechText keeps a 5% inner margin; pull the whole headline left by it so the ink starts on the hero's padding line
    // (same inset as the buttons on the right).
    <div ref={box} className="relative w-full" style={{ transform: `translateX(${-pad}px)` }} aria-hidden>
      {size &&
        rows.map((r, i) => (
          <div key={i} style={{ marginTop: i ? -font * 0.36 : 0 }}>
            {r.kind === "tech" && tech(r.text, r.tone, W)}
            {r.kind === "struck" && (
              <div className="flex items-center" style={{ height: rowH, paddingLeft: pad }}>
                {struckWord(r.text)}
              </div>
            )}
            {r.kind === "struck-tech" && (
              <div className="flex items-center" style={{ height: rowH }}>
                <div className="shrink-0" style={{ paddingLeft: pad, width: pad + size.strikeW }}>
                  {struckWord(r.struck)}
                </div>
                {tech(r.text, "ember", W - pad - size.strikeW)}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
