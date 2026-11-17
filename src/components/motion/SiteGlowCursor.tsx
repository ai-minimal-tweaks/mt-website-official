"use client";

import { useEffect, useState } from "react";
import GlowCursor from "./GlowCursor";

/** Relative luminance (0–1) of an rgb()/rgba() colour string; null when fully transparent. */
function luminance(color: string): number | null {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  if (a < 0.4) return null;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Walks up from the element under the pointer to the first solid background and reports if it is dark. */
function isDarkAt(x: number, y: number) {
  let el = document.elementFromPoint(x, y) as HTMLElement | null;
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el);
    // Shader canvases (the ember light fields) count as dark surfaces.
    if (el.tagName === "CANVAS" && !el.closest("[data-glow-cursor]")) return true;
    const l = luminance(cs.backgroundColor);
    if (l !== null) return l < 0.45;
    el = el.parentElement;
  }
  return false;
}

/**
 * Site-wide ember glow trail behind the mouse (React Bits "Glow Cursor", theme colours #ffb347 → #ff3b1a; a soft,
 * short trail: intensity 0.55, glow 0.1, hotspot 0, follow speed 0.75, linger 0.5). A fixed, click-through overlay above the page. Over dark surfaces it glows with a screen blend;
 * over light ones it switches to the component's light theme (ember ink), so the trail reads everywhere.
 * Mouse and trackpad only — touch devices and reduced-motion users never mount it.
 */
export function SiteGlowCursor() {
  const [on, setOn] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const fine = matchMedia("(pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setOn(fine.matches && !reduce.matches);
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!on) return;
    let lastCheck = 0;
    let lx = 0;
    let ly = 0;
    const check = () => setTheme(isDarkAt(lx, ly) ? "dark" : "light");
    const onMove = (e: PointerEvent) => {
      lx = e.clientX;
      ly = e.clientY;
      const now = performance.now();
      if (now - lastCheck < 120) return;
      lastCheck = now;
      check();
    };
    // Scrolling changes what is under a still pointer.
    const onScroll = () => {
      const now = performance.now();
      if (now - lastCheck < 150) return;
      lastCheck = now;
      check();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [on]);

  if (!on) return null;
  return (
    <GlowCursor
      data-glow-cursor
      aria-hidden
      color="#ffb347"
      secondaryColor="#ff3b1a"
      // React Bits settings requested for the site: intensity 0.55, glow 0.1, hotspot 0, followSpeed 0.75, linger 0.5.
      intensity={0.55}
      glow={0.1}
      hotspot={0}
      followSpeed={0.75}
      linger={0.5}
      trailWidth={3}
      grain={0}
      clickBurst
      quality="high"
      theme={theme}
      className="pointer-events-none"
      style={{ position: "fixed", inset: 0, zIndex: 89 }}
    />
  );
}
