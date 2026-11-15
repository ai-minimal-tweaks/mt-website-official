"use client";

import { usePathname } from "next/navigation";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SiteGlowCursor } from "@/components/motion/SiteGlowCursor";
import { Header } from "@/components/layout/Header";

/** Public-site chrome (smooth scroll + scroll motion, glow trail, header). The /admin CMS renders without it. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <MotionProvider>
      <SiteGlowCursor />
      <Header />
      {children}
    </MotionProvider>
  );
}
