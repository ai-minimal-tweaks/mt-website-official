"use client";

import { usePathname } from "next/navigation";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SiteGlowCursor } from "@/components/motion/SiteGlowCursor";
import ClickSpark from "@/components/motion/ClickSpark";
import { Header } from "@/components/layout/Header";
import { HOMEPAGE } from "@/lib/pages";

/** Public-site chrome (smooth scroll + scroll motion, glow trail, click sparks, header). The /admin CMS renders without it. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <MotionProvider>
      <SiteGlowCursor />
      {/* Ember sparks on every click and tap (React Bits ClickSpark, theme colours). */}
      <ClickSpark global sparkColor={["#ff6a1a", "#FE9004", "#ffb347"]} />
      {/* The temporary v2 homepage brings its own top bar. */}
      {!(pathname === "/" && HOMEPAGE === "v2") && <Header />}
      {children}
    </MotionProvider>
  );
}
