"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ctaLink, primaryNav, site, socials } from "@/lib/site";
import { Arrow, Logo, SocialIcon } from "@/components/ui";
import { useLenis } from "@/components/motion/MotionProvider";

export function Header() {
  const pathname = usePathname();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useGSAP(
    () => {
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .set(menuRef.current, { autoAlpha: 1 })
        .fromTo(menuRef.current, { clipPath: "circle(0% at 92% 4%)" }, { clipPath: "circle(150% at 92% 4%)", duration: 0.9, ease: "power3.inOut" })
        .from("[data-menu-item]", { yPercent: 110, duration: 0.8, stagger: 0.06 }, "-=0.45")
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
        className={`fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-500 ease-out-expo sm:px-6 sm:pt-5 md:pt-9 ${
          hidden && !open ? "-translate-y-[130%]" : "translate-y-0"
        }`}
      >
        <nav
          aria-label="Primary"
          className={`mx-auto flex h-14 max-w-[64rem] items-center justify-between rounded-full bg-white/95 pl-3 pr-2 backdrop-blur-xl transition-shadow duration-500 sm:h-16 sm:pl-5 ${
            scrolled ? "shadow-[0_18px_40px_-18px_rgba(0,0,0,.35)]" : "shadow-[0_8px_30px_-20px_rgba(0,0,0,.4)]"
          }`}
        >
          <Link href="/" aria-label={`${site.name} home`} className="shrink-0">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {primaryNav.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="group relative py-2 text-[0.82rem] font-medium text-ink/80 transition-colors hover:text-ink"
                  >
                    {item.label}
                    <span
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-flame transition-transform duration-500 ease-out-expo ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
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
              className="relative grid size-11 place-items-center rounded-full bg-ink text-white md:hidden"
            >
              <span className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-out-expo ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
              <span className={`absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-out-expo ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        ref={menuRef}
        className="invisible fixed inset-0 z-40 flex flex-col overflow-hidden bg-ink px-6 pb-8 pt-28 text-white md:hidden"
        aria-hidden={!open}
        inert={!open}
      >
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-flame/40 blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 size-96 rounded-full bg-blaze/40 blur-[100px]" />
        <ul className="relative flex flex-col gap-1">
          {[...primaryNav, { label: "Careers", href: "/become-a-tweaker" }].map((item) => (
            <li key={item.href} className="overflow-hidden">
              <Link
                data-menu-item
                href={item.href}
                className="flex items-baseline justify-between border-b border-white/10 py-3 text-[2.4rem] font-medium tracking-[-0.04em]"
              >
                {item.label}
                <Arrow className="size-5 text-ember" />
              </Link>
            </li>
          ))}
        </ul>
        <div data-menu-foot className="relative mt-auto space-y-5">
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
