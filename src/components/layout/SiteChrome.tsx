"use client";

import { usePathname } from "next/navigation";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SiteGlowCursor } from "@/components/motion/SiteGlowCursor";
import ClickSpark from "@/components/motion/ClickSpark";
import { Header } from "@/components/layout/Header";

/** Public-site chrome (smooth scroll + scroll motion, glow trail, click sparks, header). The /admin CMS renders without it. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <MotionProvider>
      <SiteGlowCursor />
      {/* Ember sparks on every click and tap (React Bits ClickSpark, theme colours). */}
      <ClickSpark global sparkColor={["#ff6a1a", "#FE9004", "#ffb347"]} />
      <Header />
      {children}
    </MotionProvider>
  );
}
