import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Tweaks CMS", template: "%s · Tweaks CMS" },
  robots: { index: false, follow: false },
};

/** The CMS has its own chrome; the public header, motion layer and glow trail are skipped (see SiteChrome). */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-[#f3f1ee] font-sans text-[#181b25] antialiased">{children}</div>;
}
