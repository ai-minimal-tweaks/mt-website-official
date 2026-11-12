"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ctaLink, isActive, primaryNav, site, socials } from "@/lib/site";
import { Arrow, Logo, SocialIcon } from "@/components/ui";
import { useLenis } from "@/components/motion/MotionProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Always-visible floating header with 3D depth:
 *  - two shadow plates fan out beneath the pill as you scroll (--depth 0→1), reading as a stacked card
 *  - the pill tips on its X axis with scroll velocity and springs back level when scrolling stops
 * The pill is held level while the pointer is over it: a tilting target moves the links out from under
 * the cursor and clicks land in the gaps.
 */
export function Header() {
  const pathname = usePathname();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => setOpen(false), [pathname]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 768px)" }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        const header = headerRef.current!;
        if (!motion) {
          // Depth still shows (statically) once scrolled; only the movement is dropped.
          ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => header.style.setProperty("--depth", s.scroll() > 40 ? "1" : "0") });
          return;
        }
        const maxTilt = desktop ? 9 : 6;
        const tiltX = gsap.quickTo(tiltRef.current, "rotationX", { duration: 0.5, ease: "power3.out" });
        const lift = gsap.quickTo(tiltRef.current, "z", { duration: 0.6, ease: "power3.out" });
        const settle = gsap.delayedCall(0.12, () => {
          tiltX(0);
          lift(0);
        }).pause();
        const depth = { v: 0 };
        let hovering = false;
        const tiltLayer = tiltRef.current!;
        const onEnter = () => {
          hovering = true;
          tiltX(0);
          lift(0);
        };
        const onLeave = () => (hovering = false);
        tiltLayer.addEventListener("pointerenter", onEnter);
        tiltLayer.addEventListener("pointerleave", onLeave);

        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            if (!hovering) {
              const v = self.getVelocity();
              tiltX(gsap.utils.clamp(-maxTilt, maxTilt, -v / 220));
              lift(gsap.utils.clamp(0, 40, Math.abs(v) / 60));
              settle.restart(true);
            }
            gsap.to(depth, {
              v: gsap.utils.clamp(0, 1, self.scroll() / 320),
              duration: 0.4,
              overwrite: true,
              onUpdate: () => header.style.setProperty("--depth", depth.v.toFixed(3)),
            });
          },
        });

        return () => {
          tiltLayer.removeEventListener("pointerenter", onEnter);
          tiltLayer.removeEventListener("pointerleave", onLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: headerRef },
  );

  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .set(menuRef.current, { autoAlpha: 1 })
        .fromTo(menuRef.current, { clipPath: "circle(0% at 92% 4%)" }, { clipPath: "circle(150% at 92% 4%)", duration: 0.9, ease: "power3.inOut" })
        .from("[data-menu-item]", { yPercent: 110, duration: 0.8, stagger: 0.05 }, "-=0.45")
        .from("[data-menu-foot]", { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.5");
    },
    { scope: menuRef },
  );

  useEffect(() => {
    if (open) {
      tl.current?.timeScale(1).play();
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      tl.current?.timeScale(1.6).reverse();
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
  }, [open, lenis]);

  return (
    <>
      <header
        ref={headerRef}
        style={{ "--depth": 0 } as React.CSSProperties}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 [perspective:900px] sm:px-6 sm:pt-5 md:pt-7"
      >
        <div ref={tiltRef} className="pointer-events-auto relative mx-auto max-w-[70rem] origin-top [transform-style:preserve-3d] will-change-transform">
          {/* Depth plates: stacked layers that drop away beneath the pill as --depth rises */}
          <span
            aria-hidden
            className="absolute inset-x-6 top-0 h-full rounded-full bg-ink/25 blur-[2px]"
            style={{
              transform: "translate3d(0, calc(var(--depth) * 9px), calc(var(--depth) * -40px)) scale(calc(1 - var(--depth) * 0.04))",
              opacity: "calc(var(--depth) * 0.9)",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-x-12 top-0 h-full rounded-full bg-ink/15 blur-[3px]"
            style={{
              transform: "translate3d(0, calc(var(--depth) * 17px), calc(var(--depth) * -80px)) scale(calc(1 - var(--depth) * 0.08))",
              opacity: "calc(var(--depth) * 0.7)",
            }}
          />
          {/* Scale lives on its own wrapper: GSAP owns the transforms of the tilt layer and the nav. */}
          <div className="relative" style={{ transform: "scale(calc(1 - var(--depth) * 0.025))" }}>
          <nav
            aria-label="Primary"
            className="relative flex h-14 items-center justify-between rounded-full border border-white/60 bg-white/90 pl-3 pr-2 backdrop-blur-xl sm:h-16 sm:pl-4"
            style={{
              boxShadow:
                "0 1px 0 rgba(255,255,255,.9) inset, 0 calc(6px + var(--depth) * 16px) calc(24px + var(--depth) * 30px) calc(-14px - var(--depth) * 4px) rgba(0,0,0,calc(.28 + var(--depth) * .2))",
            }}
          >
            <Link href="/" aria-label={`${site.name} home`} className="flex h-11 shrink-0 items-center pr-3">
              <Logo />
            </Link>

            {/* Each link is a full 44px-tall rectangle with no gaps between neighbours. The rounded hover pill is
                drawn on an inner layer: browsers hit-test border-radius, so a rounded <a> has dead corners. */}
            <ul className="hidden items-center lg:flex">
              {primaryNav.map((item) => {
                const active = isActive(item, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex h-11 items-center px-3.5 text-[0.82rem] font-medium transition-colors duration-300 xl:px-4 ${
                        active ? "text-flame" : "text-ink/75 hover:text-ink"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute inset-x-0.5 inset-y-1 rounded-full transition-colors duration-300 ${active ? "" : "group-hover:bg-ink/[0.06]"}`}
                      />
                      <span className="relative">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2">
              <Link
                href={ctaLink.href}
                className="hidden h-11 items-center rounded-full bg-[radial-gradient(120%_160%_at_85%_0%,#ff8a3d_0%,#b8400f_40%,#170a04_100%)] px-5 text-[0.78rem] font-semibold text-white shadow-[0_8px_22px_-10px_rgba(194,65,12,.9)] transition hover:brightness-110 sm:inline-flex"
              >
                {ctaLink.label}
              </Link>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="relative grid size-11 place-items-center rounded-full bg-ink text-white lg:hidden"
              >
                <span className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-out-expo ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
                <span className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-out-expo ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
              </button>
            </div>
          </nav>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={menuRef}
        className="invisible fixed inset-0 z-40 flex flex-col overflow-y-auto overflow-x-hidden bg-ink px-6 pb-8 pt-24 text-white lg:hidden"
        aria-hidden={!open}
        inert={!open}
      >
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-flame/40 blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-blaze/40 blur-[100px]" />
        <ul className="relative flex flex-col">
          {[...primaryNav, { label: "Careers", href: "/become-a-tweaker" }].map((item) => (
            <li key={item.href} className="overflow-hidden">
              <Link
                data-menu-item
                href={item.href}
                className={`flex items-baseline justify-between border-b border-white/10 py-2.5 text-[2.1rem] font-medium tracking-[-0.04em] ${
                  isActive(item, pathname) ? "text-ember" : ""
                }`}
              >
                {item.label}
                <Arrow className="size-5 text-ember" />
              </Link>
            </li>
          ))}
        </ul>
        <div data-menu-foot className="relative mt-auto space-y-5 pt-8">
          <Link
            href={ctaLink.href}
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold uppercase tracking-[0.06em] text-ink"
          >
            Let&apos;s start tweaking <Arrow className="size-4" />
          </Link>
          <div className="flex items-center justify-between text-sm text-white/60">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <div className="flex gap-3">
              {socials.slice(0, 3).map((s) => (
                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <SocialIcon name={s.key} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
