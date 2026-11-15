"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LogoMark } from "@/components/ui";

// Last path that played (or skipped) the transition. Module scope survives re-mounts, so the first load
// and React's dev double-mount don't play it — only a real move to a different route does.
let lastPath: string | null = null;

/**
 * Route transition: an ink curtain carrying the MT mark lifts off the new page while the page itself
 * rises into place. Runs in a layout effect so the curtain is up before the new page first paints.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);

  // Decided once per mounted page, so React's dev double-invoke of effects replays the same transition.
  const isNavigation = useRef<boolean | null>(null);

  useLayoutEffect(() => {
    if (isNavigation.current === null) {
      isNavigation.current = lastPath !== null && lastPath !== pathname;
      lastPath = pathname;
    }
    if (!isNavigation.current || pathname.startsWith("/admin") || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tl = gsap
      .timeline({ defaults: { ease: "expo.inOut" } })
      .set(curtain.current, { autoAlpha: 1, yPercent: 0 })
      .from("[data-curtain-mark]", { scale: 0.6, autoAlpha: 0, duration: 0.35, ease: "back.out(2)" })
      .to(curtain.current, { yPercent: -100, duration: 0.95 }, "+=0.08")
      .to("[data-curtain-mark]", { yPercent: -120, autoAlpha: 0, duration: 0.5, ease: "power3.in" }, "<")
      .from(page.current, { y: 120, duration: 1.2, ease: "expo.out", clearProps: "transform" }, "<+0.25")
      .set(curtain.current, { autoAlpha: 0 })
      // Scroll triggers were measured while the page was offset; measure again now it has settled.
      .call(() => ScrollTrigger.refresh());
    return () => {
      // Never leave the curtain over the page if the transition is interrupted.
      tl.kill();
      gsap.set(curtain.current, { autoAlpha: 0, yPercent: 0 });
      gsap.set("[data-curtain-mark]", { clearProps: "all" });
      gsap.set(page.current, { clearProps: "transform" });
    };
  }, [pathname]);

  return (
    <>
      <div
        ref={curtain}
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-[70] grid place-items-center overflow-hidden rounded-b-[2.5rem] bg-ink"
      >
        <div aria-hidden className="absolute -bottom-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-flame/40 blur-[120px]" />
        <span data-curtain-mark className="relative block">
          <LogoMark className="size-16" />
        </span>
      </div>
      <div ref={page}>{children}</div>
    </>
  );
}
