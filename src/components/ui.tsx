import { useId } from "react";
import Link from "next/link";
import { site, type SocialKey } from "@/lib/site";
import { resolveHref } from "@/lib/pages";

const discoveryCallHref = `mailto:${site.email}?subject=${encodeURIComponent("Book a discovery call")}`;

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
  glass: "liquid-glass relative text-white hover:bg-white/15",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-white",
  flame:
    "bg-[radial-gradient(120%_140%_at_80%_0%,#ff8a3d_0%,#c2410c_45%,#1a0b05_100%)] text-white shadow-[0_8px_24px_-10px_rgba(194,65,12,.8)] hover:brightness-110",
};

/** Rounded pill CTA used across the site. Uppercase label + arrow, per the design. */
export function Pill({ href: rawHref, children, variant = "dark", size = "md", external, className = "" }: PillProps) {
  // One-pager mode (src/lib/pages.ts): links to hidden pages go to their homepage section; with no section, no button.
  const href = external ? rawHref : resolveHref(rawHref, { discoveryCall: discoveryCallHref });
  if (!href) return null;
  const isMail = href.startsWith("mailto:");
    // No `transition-all`: the magnetic pull animates transform from JS, and a CSS transform transition would fight it.
  const cls = `group inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold uppercase tracking-[0.06em] transition-[background-color,color,border-color,box-shadow,filter,scale] duration-300 ease-out-expo active:scale-[0.97] ${
    size === "sm" ? "h-9 px-4 text-[0.66rem]" : "h-12 px-6 text-[0.72rem]"
  } ${variants[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <Arrow className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </>
  );
  return external || isMail ? (
    <a href={href} {...(external && { target: "_blank", rel: "noopener noreferrer" })} className={cls} data-magnetic>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls} data-magnetic>
      {inner}
    </Link>
  );
}

/**
 * A Link that respects one-pager mode: a hidden page becomes its homepage section, or, when it has none
 * (e.g. a case study), the content renders as a plain <div> with the same styling and no link.
 */
export function SmartLink({ href, children, ...rest }: { href: string; children: React.ReactNode } & Omit<React.HTMLAttributes<HTMLElement>, "href"> & Record<`data-${string}`, unknown>) {
  const to = resolveHref(href);
  return to ? (
    <Link href={to} {...rest}>
      {children}
    </Link>
  ) : (
    <div {...rest}>{children}</div>
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

/** Official Minimal Tweaks logo (public/images/brand/minimal-tweaks-logo.svg), split into the mark and the wordmark. */
const MARK_TILE = "M38.7381 0H2.68804C1.20347 0 0 1.20276 0 2.68643V38.7149C0 40.1985 1.20347 41.4013 2.68804 41.4013H38.7381C40.2226 41.4013 41.4261 40.1985 41.4261 38.7149V2.68643C41.4261 1.20276 40.2226 0 38.7381 0Z";
const MARK_MT = [
  "M18.5502 18.1393V22.8386L14.2191 18.5176V27.5834H10.895V13.8107H14.2191L18.5502 18.1393Z",
  "M30.5335 13.8107V17.1404H26.2099V27.5834H22.8782V17.1404H18.5547V13.8107H30.5335Z",
];
const WORDMARK = [
  "M67.0846 12.2189L62.0191 19.5971L56.9385 12.2189H53.1978V28.8217H57.1353V19.0825L62.0041 25.7418L66.8878 19.0825V28.8066H70.8404V12.2189H67.0846Z",
  "M76.4501 12.2189C76.4172 12.7756 76.1729 13.2989 75.767 13.6815C75.3607 14.0641 74.8237 14.2772 74.2656 14.2772C73.7075 14.2772 73.1705 14.0641 72.7646 13.6815C72.3587 13.2989 72.1139 12.7756 72.0811 12.2189H76.4501Z",
  "M76.1178 16.7209H72.332V28.8136H76.1178V16.7209Z",
  "M88.301 17.8411C87.8647 17.3405 87.3188 16.9476 86.705 16.6929C86.0917 16.4382 85.4277 16.3287 84.7649 16.373C84.0854 16.352 83.41 16.4855 82.7898 16.7634C82.1692 17.0413 81.62 17.4563 81.1836 17.9773V16.7136H77.3975V28.8214H81.1836V22.9113C81.1378 22.1319 81.3533 21.3595 81.797 20.7167C81.9979 20.4547 82.2589 20.2445 82.558 20.1036C82.8572 19.9628 83.1855 19.8953 83.5155 19.907C84.9617 19.907 85.6887 20.7773 85.6887 22.5405V28.8214H89.4749V21.7837C89.556 20.3729 89.1408 18.9781 88.301 17.8411Z",
  "M94.6532 12.2189C94.6561 12.5025 94.5997 12.7837 94.4876 13.0444C94.3756 13.305 94.21 13.5393 94.0018 13.7323C93.6986 14.0339 93.3126 14.2395 92.8933 14.3235C92.4736 14.4076 92.0385 14.3664 91.6419 14.205C91.2457 14.0436 90.9056 13.7693 90.6641 13.4161C90.4226 13.0629 90.2903 12.6465 90.2842 12.2189H94.6532Z",
  "M94.3126 16.7209H90.5269V28.8136H94.3126V16.7209Z",
  "M113.727 17.7579C113.268 17.297 112.718 16.9362 112.112 16.6978C111.506 16.4595 110.857 16.349 110.207 16.373C109.464 16.3487 108.723 16.481 108.034 16.7613C107.346 17.0417 106.724 17.4637 106.209 18.0001C105.814 17.4522 105.285 17.0148 104.672 16.7299C104.06 16.445 103.384 16.3222 102.711 16.373C102.076 16.3579 101.446 16.4861 100.868 16.7482C100.29 17.0102 99.7781 17.3993 99.3714 17.8865V16.6984H95.5852V28.8063H99.3714V22.8129C99.3714 20.853 100.083 19.8843 101.484 19.8843C102.771 19.8843 103.399 20.7546 103.399 22.5178V28.7987H107.186V22.8129C107.186 20.853 107.897 19.8843 109.298 19.8843C110.585 19.8843 111.222 20.7546 111.222 22.5178V28.7987H115.007V21.6626C115.108 20.2439 114.648 18.8423 113.727 17.7579Z",
  "M125.562 16.7139V17.8414C125.119 17.3582 124.575 16.9768 123.97 16.7233C123.365 16.4699 122.712 16.3505 122.056 16.3733C121.27 16.3636 120.491 16.5228 119.77 16.84C119.051 17.1573 118.407 17.6252 117.884 18.2122C116.798 19.476 116.201 21.0868 116.201 22.7526C116.201 24.4185 116.798 26.0292 117.884 27.2931C118.41 27.8754 119.054 28.3392 119.774 28.6536C120.493 28.9681 121.271 29.126 122.056 29.1168C122.71 29.1371 123.36 29.0188 123.964 28.7696C124.569 28.5205 125.113 28.1462 125.562 27.6714V28.7763H129.348V16.6684L125.562 16.7139ZM124.851 24.932C124.58 25.2093 124.256 25.4282 123.898 25.5753C123.54 25.7224 123.155 25.7945 122.768 25.7871C122.388 25.7955 122.009 25.7237 121.659 25.5764C121.308 25.4291 120.992 25.2095 120.731 24.932C120.467 24.634 120.264 24.2868 120.134 23.9102C120.004 23.5336 119.949 23.1351 119.974 22.7375C119.952 22.3471 120.008 21.9562 120.138 21.5874C120.268 21.2186 120.469 20.879 120.731 20.5884C120.994 20.3154 121.311 20.1003 121.662 19.957C122.013 19.8136 122.389 19.7452 122.768 19.756C123.154 19.7461 123.537 19.8148 123.895 19.958C124.253 20.1011 124.578 20.3156 124.851 20.5884C125.121 20.8752 125.332 21.213 125.471 21.5818C125.61 21.9507 125.675 22.3435 125.661 22.7375C125.688 23.5466 125.397 24.3342 124.851 24.932Z",
  "M130.59 12.2189V28.8217H134.376V12.2189H130.59Z",
  "M137.85 12.2189V15.7755H143.151V28.8217H147.111V15.7604H152.411V12.2189H137.85Z",
  "M165.307 16.7138L163.134 23.9634L160.915 16.7138H157.75L155.554 23.9634L153.366 16.7138H149.444L153.616 28.8217H157.137L159.333 22.011L161.529 28.8217H165.049L169.221 16.7138H165.307Z",
  "M181.648 22.6386C181.675 21.8151 181.537 20.9944 181.241 20.225C180.946 19.4556 180.5 18.753 179.929 18.1587C179.328 17.5516 178.604 17.0787 177.807 16.7709C177.01 16.4631 176.156 16.3274 175.302 16.3728C174.447 16.3399 173.594 16.485 172.798 16.7989C172.001 17.1129 171.279 17.5888 170.676 18.1966C170.082 18.8053 169.618 19.5284 169.312 20.3219C169.006 21.1155 168.865 21.9629 168.897 22.8126C168.864 23.6656 169.011 24.5159 169.328 25.3086C169.644 26.1012 170.124 26.8184 170.737 27.4137C171.381 28.0087 172.137 28.4707 172.961 28.7733C173.785 29.0758 174.66 29.213 175.537 29.1768C176.877 29.2237 178.2 28.8564 179.323 28.125C180.258 27.5754 181.002 26.7545 181.459 25.7715L178.036 24.7877C177.793 25.2 177.437 25.5344 177.011 25.7515C176.584 25.9687 176.104 26.0596 175.628 26.0137C173.902 26.0137 172.895 25.3175 172.599 23.9402H181.542C181.613 23.51 181.648 23.0746 181.648 22.6386ZM172.615 21.617C172.706 21.0461 173.009 20.5303 173.463 20.1716C173.972 19.7497 174.619 19.5313 175.28 19.5587C175.944 19.5291 176.597 19.7385 177.12 20.1489C177.349 20.326 177.541 20.5471 177.684 20.7992C177.827 21.0512 177.918 21.3293 177.953 21.617H172.615Z",
  "M192.195 16.7136V17.8412C191.757 17.3591 191.219 16.9781 190.619 16.7246C190.019 16.4711 189.371 16.3511 188.72 16.3731C187.932 16.3608 187.15 16.5188 186.429 16.8362C185.708 17.1536 185.063 17.6228 184.54 18.212C183.441 19.4695 182.835 21.0827 182.835 22.7524C182.835 24.4222 183.441 26.0353 184.54 27.2929C185.066 27.8773 185.711 28.3425 186.432 28.657C187.153 28.9716 187.933 29.1283 188.72 29.1166C189.369 29.1379 190.015 29.0199 190.615 28.7706C191.214 28.5213 191.753 28.1464 192.195 27.6712V28.7761H195.981V16.6682L192.195 16.7136ZM191.484 24.9318C191.218 25.2126 190.895 25.4339 190.538 25.5813C190.18 25.7287 189.795 25.7988 189.409 25.7869C189.032 25.7945 188.657 25.7222 188.31 25.5749C187.963 25.4275 187.651 25.2083 187.395 24.9318C187.119 24.6387 186.905 24.2936 186.765 23.9168C186.625 23.54 186.561 23.139 186.577 22.7373C186.563 22.3426 186.627 21.949 186.768 21.5798C186.908 21.2107 187.121 20.8735 187.395 20.5882C187.653 20.3162 187.966 20.1015 188.313 19.9581C188.66 19.8147 189.034 19.7458 189.409 19.7557C189.793 19.7456 190.175 19.8142 190.532 19.9574C190.889 20.1006 191.213 20.3152 191.484 20.5882C191.762 20.8707 191.979 21.2071 192.122 21.5767C192.265 21.9462 192.332 22.3413 192.317 22.7373C192.331 23.1401 192.265 23.5417 192.122 23.9185C191.978 24.2954 191.762 24.6399 191.484 24.9318Z",
  "M201.024 12.2189V21.1559L204.658 16.729H209.035L204.545 21.9051L209.428 28.8217H205.158L202.19 24.6369L201.024 25.9612V28.8217H197.238V12.2189H201.024Z",
  "M210.64 28.0422C209.636 27.4391 208.877 26.5011 208.497 25.3936L211.882 24.4023C212.092 24.9226 212.457 25.3662 212.927 25.6737C213.451 26.0063 214.062 26.1749 214.683 26.1579C215.069 26.1774 215.452 26.0882 215.789 25.9007C215.906 25.8421 216.006 25.7541 216.079 25.6454C216.152 25.5366 216.195 25.4108 216.205 25.2801C216.205 24.8866 215.827 24.5764 215.07 24.3494L212.169 23.4942C210.133 22.8813 209.141 21.7537 209.141 20.1267C209.151 19.5918 209.295 19.0678 209.559 18.6026C209.824 18.1373 210.2 17.7456 210.655 17.463C211.689 16.732 212.932 16.355 214.199 16.3884C215.392 16.3612 216.572 16.6455 217.621 17.2133C218.55 17.7086 219.278 18.5111 219.681 19.4835L216.357 20.4294C216.119 20.071 215.794 19.7787 215.413 19.5802C215.032 19.3816 214.606 19.2832 214.176 19.2943C213.863 19.289 213.553 19.3619 213.275 19.5062C213.166 19.5516 213.072 19.6268 213.003 19.7231C212.935 19.8195 212.895 19.9331 212.889 20.051C212.889 20.3613 213.124 20.6035 213.585 20.77L216.379 21.5267C216.855 21.6493 217.321 21.8087 217.773 22.0034C218.165 22.1778 218.539 22.3935 218.886 22.6467C219.254 22.9007 219.545 23.2516 219.726 23.6607C219.916 24.1211 220.009 24.6157 219.999 25.1136C220.002 25.6836 219.866 26.2459 219.603 26.7511C219.338 27.2564 218.954 27.6893 218.484 28.012C217.35 28.8075 215.984 29.2065 214.6 29.1471C213.199 29.1873 211.818 28.8021 210.64 28.0422Z",
];

function MarkPaths({ gid }: { gid: string }) {
  return (
    <>
      <defs>
        <radialGradient id={gid} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.00246388 -0.0161371) rotate(45.6901) scale(59.3005 148.17)">
          <stop stopColor="#3B0274" />
          <stop offset="0.5381" stopColor="#031547" />
        </radialGradient>
      </defs>
      <path d={MARK_TILE} fill={`url(#${gid})`} />
      {MARK_MT.map((d) => (
        <path key={d} d={d} fill="#FE9004" />
      ))}
    </>
  );
}

/** The square MT mark on its own. */
export function LogoMark({ className = "size-8", title }: { className?: string; title?: string }) {
  const gid = `mt-mark-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 41.43 41.41" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <MarkPaths gid={gid} />
    </svg>
  );
}

/**
 * The full logo: mark + "Minimal Tweaks" wordmark. The wordmark takes the text colour (currentColor), so the same
 * logo works on light (#1A1A1A) and dark backgrounds.
 */
export function LogoLockup({ className = "h-9 w-auto", title = "Minimal Tweaks" }: { className?: string; title?: string }) {
  const gid = `mt-logo-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 220 41.41" className={className} role="img" aria-label={title}>
      <MarkPaths gid={gid} />
      {WORDMARK.map((d) => (
        <path key={d} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}

export function Logo({ tone = "dark", withWordmark = true }: { tone?: "dark" | "light"; withWordmark?: boolean }) {
  if (!withWordmark) return <LogoMark className="size-9" />;
  return <LogoLockup className={`h-9 w-auto ${tone === "dark" ? "text-[#1A1A1A]" : "text-white"}`} />;
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
