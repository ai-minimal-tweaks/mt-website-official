"use client";

import { createContext, useCallback, useContext, useState } from "react";

/* Small CRM-style UI kit for the CMS: buttons, fields, cards, badges, toasts, modal. */

export const brand = { navy: "#0F2944", ember: "#FE9004", flame: "#ff6a1a" };

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "brand" | "neutral" | "destructive" | "ghost"; size?: "sm" | "md" };
export function Button({ variant = "neutral", size = "md", className = "", ...rest }: BtnProps) {
  const v = {
    brand: "bg-[#0F2944] text-white border-[#0F2944] hover:bg-[#173a5f]",
    neutral: "bg-white text-[#0F2944] border-[#d6d1ca] hover:bg-[#f7f5f2]",
    destructive: "bg-[#c23934] text-white border-[#c23934] hover:bg-[#a52e2a]",
    ghost: "bg-transparent text-[#0F2944] border-transparent hover:bg-black/5",
  }[variant];
  const s = size === "sm" ? "h-8 px-3 text-[0.8rem]" : "h-9 px-4 text-sm";
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${v} ${s} ${className}`}
      {...rest}
    />
  );
}

export function Card({ title, icon, actions, children, className = "", bodyClass = "p-4" }: { title?: React.ReactNode; icon?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={`rounded-lg border border-[#e2ddd6] bg-white shadow-[0_2px_2px_rgba(15,41,68,.06)] ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-[#ece8e2] px-4 py-3">
          <h2 className="flex items-center gap-2.5 text-[0.95rem] font-semibold text-[#181b25]">
            {icon}
            {title}
          </h2>
          {actions}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

/** Square object icon tile, like a CRM object badge. */
export function IconTile({ children, tone = "ember", size = "md" }: { children: React.ReactNode; tone?: "ember" | "navy" | "flame"; size?: "sm" | "md" | "lg" }) {
  const bg = { ember: "bg-[#FE9004]", navy: "bg-[#0F2944]", flame: "bg-[radial-gradient(120%_140%_at_80%_0%,#ff8a3d_0%,#c2410c_60%,#1a0b05_100%)]" }[tone];
  const s = { sm: "size-6 rounded", md: "size-8 rounded-md", lg: "size-12 rounded-lg" }[size];
  return <span className={`grid shrink-0 place-items-center text-white ${bg} ${s}`}>{children}</span>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "ember" | "navy" }) {
  const t = {
    neutral: "bg-[#f1eee9] text-[#4a4f5c]",
    success: "bg-[#e6f4ea] text-[#1e6b3a]",
    warning: "bg-[#fdf1dc] text-[#8a5300]",
    ember: "bg-[#fff1e3] text-[#b45309]",
    navy: "bg-[#e8edf4] text-[#0F2944]",
  }[tone];
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[0.7rem] font-semibold ${t}`}>{children}</span>;
}

export function Field({ label, hint, error, required, children, className = "" }: { label: string; hint?: React.ReactNode; error?: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[0.75rem] font-medium text-[#555b68]">
        {required && <abbr title="required" className="mr-0.5 no-underline text-[#c23934]">*</abbr>}
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-[0.75rem] text-[#c23934]">{error}</span> : hint ? <span className="mt-1 block text-[0.72rem] text-[#7a7f8b]">{hint}</span> : null}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-[#d6d1ca] bg-white px-3 py-2 text-sm text-[#181b25] outline-none transition placeholder:text-[#a3a7b0] focus:border-[#0F2944] focus:ring-2 focus:ring-[#0F2944]/15";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-center gap-2.5 text-sm text-[#181b25]">
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-[#0F2944]" : "bg-[#cfcac3]"}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${checked ? "left-[1.125rem]" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

/* Toasts */
type Toast = { id: number; tone: "success" | "error" | "info"; title: string; body?: React.ReactNode };
const ToastCtx = createContext<(t: Omit<Toast, "id">) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { ...t, id }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 5000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-lg items-start gap-3 rounded-md px-4 py-3 text-sm text-white shadow-lg ${
              t.tone === "success" ? "bg-[#2e844a]" : t.tone === "error" ? "bg-[#ba0517]" : "bg-[#0F2944]"
            }`}
          >
            <span aria-hidden className="mt-0.5 font-bold">{t.tone === "success" ? "✓" : t.tone === "error" ? "!" : "i"}</span>
            <div className="flex-1">
              <p className="font-semibold">{t.title}</p>
              {t.body && <div className="mt-0.5 text-white/90">{t.body}</div>}
            </div>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))} className="text-white/80 hover:text-white">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function Modal({ open, title, children, footer, onClose }: { open: boolean; title: string; children: React.ReactNode; footer: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[#0b1220]/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl">
        <header className="border-b border-[#ece8e2] px-6 py-4 text-center text-lg font-semibold">{title}</header>
        <div className="px-6 py-5 text-sm text-[#3a3f4b]">{children}</div>
        <footer className="flex justify-end gap-2 border-t border-[#ece8e2] bg-[#f7f5f2] px-6 py-3">{footer}</footer>
      </div>
    </div>
  );
}

export { Icon } from "./icons";
