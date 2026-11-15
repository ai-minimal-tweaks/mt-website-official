"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoMark } from "@/components/ui";
import { Icon, ToastProvider } from "./ui";

const tabs = [
  { label: "Home", href: "/admin", exact: true },
  { label: "Case Studies", href: "/admin/case-studies" },
];

/** CRM-style console chrome: global header (app launcher, search, user menu) + app navigation tabs. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => menuRef.current && !menuRef.current.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const logout = async () => {
    await fetch("/api/cms/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  const search = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
    router.push(q ? `/admin/case-studies?q=${encodeURIComponent(q)}` : "/admin/case-studies");
  };

  return (
    <ToastProvider>
      <header className="sticky top-0 z-40 border-b border-[#e2ddd6] bg-white">
        <div className="flex h-14 items-center gap-3 px-3 sm:px-5">
          <Link href="/admin" className="flex items-center gap-2.5" aria-label="CMS home">
            <LogoMark className="size-8" />
            <span className="hidden text-[0.95rem] font-semibold tracking-tight text-[#0F2944] sm:inline">Tweaks CMS</span>
          </Link>
          <form onSubmit={search} role="search" className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-md border border-[#d6d1ca] bg-[#f7f5f2] px-3 focus-within:border-[#0F2944] focus-within:bg-white">
            <span className="text-[#7a7f8b]">{Icon.search}</span>
            <input name="q" placeholder="Search case studies…" aria-label="Search case studies" className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-[#9a9ea8]" />
          </form>
          <a href="/work" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-[#0F2944] hover:bg-black/5 md:inline-flex">
            View site {Icon.ext}
          </a>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-haspopup="menu"
              aria-expanded={menu}
              aria-label="Account menu"
              className="grid size-9 place-items-center rounded-full bg-[radial-gradient(120%_140%_at_80%_0%,#ff8a3d_0%,#c2410c_60%,#1a0b05_100%)] text-xs font-bold text-white"
            >
              MT
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 top-11 w-56 overflow-hidden rounded-lg border border-[#e2ddd6] bg-white py-1 shadow-xl">
                <p className="border-b border-[#ece8e2] px-4 py-2.5 text-sm">
                  <span className="block font-semibold">CMS Admin</span>
                  <span className="text-xs text-[#7a7f8b]">mtadmincms</span>
                </p>
                <a role="menuitem" href="/work" target="_blank" rel="noreferrer" className="block px-4 py-2 text-sm hover:bg-[#f7f5f2]">
                  View /work page
                </a>
                <button role="menuitem" type="button" onClick={logout} className="block w-full px-4 py-2 text-left text-sm text-[#ba0517] hover:bg-[#f7f5f2]">
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
        <nav aria-label="CMS" className="flex items-end gap-1 overflow-x-auto border-t border-[#ece8e2] bg-white px-3 sm:px-5">
          <span className="mr-3 hidden py-2.5 text-[0.95rem] font-semibold text-[#181b25] sm:inline">Website</span>
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap border-b-[3px] px-3 py-2.5 text-sm transition-colors ${
                  active ? "border-[#FE9004] font-semibold text-[#0F2944]" : "border-transparent text-[#4a4f5c] hover:border-[#e2ddd6] hover:text-[#0F2944]"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {/* Brand band behind the page header, like a CRM's themed backdrop */}
      <div className="relative">
        <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(120deg,#0F2944_0%,#1b2f52_55%,#7a2c00_100%)]" />
        <div className="relative px-3 pb-12 pt-4 sm:px-5">{children}</div>
      </div>
    </ToastProvider>
  );
}
