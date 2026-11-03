import Link from "next/link";
import type { SocialKey } from "@/lib/site";

type PillProps = {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "light" | "glass" | "outline" | "flame";
  size?: "sm" | "md";
  external?: boolean;
  className?: string;
};

const variants = {
  dark: "bg-ink text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,.55)] hover:bg-ink-soft",
  light: "bg-white text-ink shadow-[0_10px_30px_-14px_rgba(0,0,0,.35)] hover:bg-mist",
  glass:
    "border border-white/20 bg-white/10 text-white backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,.18)] hover:bg-white/20",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-white",
  flame:
    "bg-[radial-gradient(120%_140%_at_80%_0%,#ff8a3d_0%,#c2410c_45%,#1a0b05_100%)] text-white shadow-[0_8px_24px_-10px_rgba(194,65,12,.8)] hover:brightness-110",
};

/** Rounded pill CTA used across the site. Uppercase label + arrow, per the design. */
export function Pill({ href, children, variant = "dark", size = "md", external, className = "" }: PillProps) {
  const cls = `group inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold uppercase tracking-[0.06em] transition-all duration-300 ease-out-expo active:scale-[0.97] ${
    size === "sm" ? "h-9 px-4 text-[0.66rem]" : "h-12 px-6 text-[0.72rem]"
  } ${variants[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <Arrow className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Placeholder brand mark — swap for the final logo SVG when supplied. */
export function Logo({ tone = "dark", withWordmark = true }: { tone?: "dark" | "light"; withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center whitespace-nowrap rounded-md bg-navy font-sans text-[0.7rem] font-bold tracking-tight text-white">
        M<span className="text-ember">T</span>
      </span>
      {withWordmark && (
        <span className={`font-sans text-[0.95rem] font-semibold tracking-tight ${tone === "dark" ? "text-ink" : "text-white"}`}>
          Minimal Tweaks
        </span>
      )}
    </span>
  );
}

/** Two-tone section heading: muted sans line + italic serif line, each masked for the reveal. */
export function SectionHeading({
  lead,
  accent,
  as: Tag = "h2",
  className = "",
  align = "left",
}: {
  lead: string;
  accent: string;
  as?: "h1" | "h2";
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <Tag data-anim="lines" className={`text-heading font-medium tracking-[-0.035em] ${align === "center" ? "text-center" : ""} ${className}`}>
      <span className="line-mask">
        <span className="text-muted">{lead}</span>
      </span>
      <span className="line-mask">
        <span className="accent text-ink">{accent}</span>
      </span>
    </Tag>
  );
}

export function SocialIcon({ name, className = "size-4" }: { name: SocialKey; className?: string }) {
  const common = { viewBox: "0 0 24 24", className, "aria-hidden": true } as const;
  switch (name) {
    case "x":
      return (
        <svg {...common} fill="currentColor">
          <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common} fill="currentColor">
          <path d="M4.5 3A1.5 1.5 0 0 0 3 4.5v15A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5v-15A1.5 1.5 0 0 0 19.5 3h-15Zm1.9 6.6h2.7V18H6.4V9.6Zm1.35-4.3a1.55 1.55 0 1 1 0 3.1 1.55 1.55 0 0 1 0-3.1Zm3.05 4.3h2.6v1.15h.04c.36-.68 1.24-1.4 2.56-1.4 2.74 0 3.25 1.8 3.25 4.15V18H16.5v-4.06c0-.97-.02-2.22-1.35-2.22-1.36 0-1.57 1.06-1.57 2.15V18H10.8V9.6Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} fill="currentColor">
          <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M4 20l1.2-4.1A8.5 8.5 0 1 1 8.4 19L4 20Z" />
          <path
            d="M9.2 8.6c.2-.4.5-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.5.9 1.3 1.7 2.3 2.2.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .6-.3 1.4-1.2 1.7-.8.3-2.2.3-4.2-1.1-1.9-1.3-3-3.1-3.2-3.9-.3-1.2 0-2 .4-2.6Z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
  }
}
