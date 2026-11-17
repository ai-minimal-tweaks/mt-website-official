import Image from "next/image";
import Link from "next/link";
import { GradientField } from "@/components/three/GradientField";
import { HeroScene } from "@/components/three/HeroScene";
import { Arrow, Pill } from "@/components/ui";
import { caseStudyHref, isUploaded, type CaseStudy } from "@/content/case-studies";

/** A word wrapped in a Figma-style selection box with corner handles (hero headlines). */
export function SelectWord({ children }: { children: React.ReactNode }) {
  return (
    <span data-anim="select" className="relative inline-block px-[0.1em]">
      <span data-select-box aria-hidden className="absolute inset-0 border border-ember/90 bg-ember/15" />
      {(["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"] as const).map((pos) => (
        <span key={pos} data-select-handle aria-hidden className={`absolute ${pos} size-2 rounded-[2px] bg-ember`} />
      ))}
      <em className="relative font-serif font-light italic tracking-[-0.03em] text-ember">{children}</em>
    </span>
  );
}

/**
 * Floating liquid-glass lenses for the dark shells. They refract the light field behind them, bob on a
 * slow loop and drift at different parallax speeds, so scrolling reads as a camera moving through depth.
 */
export function GlassOrbs({ variant = "page" }: { variant?: "page" | "hero" }) {
  const orbs =
    variant === "hero"
      ? [
          { pos: "left-[6%] top-[22%] size-28 sm:size-40 rounded-full", speed: -40, dur: "11s" },
          { pos: "right-[7%] top-[16%] h-20 w-40 sm:h-28 sm:w-56 rounded-full", speed: 30, dur: "13s" },
          { pos: "bottom-[14%] right-[18%] size-16 sm:size-24 rounded-[1.75rem]", speed: -70, dur: "9s", lens: true },
          { pos: "bottom-[18%] left-[16%] hidden sm:block h-14 w-28 rounded-full", speed: 55, dur: "12s" },
        ]
      : [
          { pos: "-left-6 top-[30%] size-24 sm:size-36 rounded-full", speed: -45, dur: "11s" },
          { pos: "right-[6%] top-[22%] hidden sm:block h-24 w-44 rounded-full", speed: 35, dur: "13s" },
          { pos: "bottom-[10%] right-[14%] size-14 sm:size-20 rounded-[1.4rem]", speed: -70, dur: "9s", lens: true },
        ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
      {orbs.map((o, i) => (
        <div key={i} data-anim="parallax" data-speed={o.speed} className={`absolute ${o.pos.split(" ").filter((c) => !c.startsWith("rounded")).join(" ")}`}>
          <div
            className={`liquid-glass relative size-full ${"lens" in o ? "lg-lens" : ""} ${o.pos.split(" ").find((c) => c.startsWith("rounded")) ?? ""} motion-safe:animate-[glass-float_ease-in-out_infinite]`}
            style={{ animationDuration: o.dur, animationDelay: `${i * -2.3}s` }}
          />
        </div>
      ))}
    </div>
  );
}

/** Dark rounded hero shell with the liquid-light shader — shared by every inner page. */
export function PageHero({
  children,
  align = "center",
  className = "",
  bias,
}: {
  children: React.ReactNode;
  align?: "center" | "left";
  className?: string;
  bias?: [number, number];
}) {
  return (
    <section className="relative p-2 sm:p-3">
      <div
        data-anim="shell"
        className={`relative isolate overflow-hidden rounded-[1.5rem] bg-ink text-white will-change-transform sm:rounded-shell ${className}`}
      >
        <GradientField bias={bias} priority />
        <HeroScene side={align === "left" ? "right" : "both"} />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgba(0,0,0,.35),transparent_70%)]" />
        <div className={`container-site relative z-10 pb-16 pt-32 sm:pb-20 sm:pt-40 ${align === "center" ? "text-center" : ""}`}>{children}</div>
      </div>
    </section>
  );
}

/** Light pre-footer card: "Got a brand to move?" + start / discovery-call actions. */
export function CtaBand({ lead, accent, body }: { lead: string; accent: string; body: string }) {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-site">
        <div data-anim="camera" className="relative grid gap-8 overflow-hidden rounded-[1.5rem] bg-mist px-6 py-12 sm:px-12 sm:py-16 md:grid-cols-2 md:items-center">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-peach blur-[90px]" />
          <h2 data-anim="lines" className="relative text-heading font-medium tracking-[-0.04em]">
            <span className="line-mask">
              <span className="text-muted">{lead}</span>
            </span>
            <span className="line-mask">
              <span className="accent">{accent}</span>
            </span>
          </h2>
          <div className="relative">
            <p className="max-w-md font-serif text-[1.05rem] leading-snug text-subtle">{body}</p>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <Pill href="/contact" variant="flame">
                Start a project
              </Pill>
              <Pill href="/contact#discovery-call" variant="outline">
                Book a discovery call
              </Pill>
              <span aria-hidden className="pointer-events-none absolute left-[7.5rem] top-[3.2rem] motion-safe:animate-[float_7s_ease-in-out_infinite]">
                <svg viewBox="0 0 16 16" className="size-4 -rotate-12 text-ember drop-shadow" fill="currentColor">
                  <path d="M2 1l12 6-5.2 1.3L6.5 14z" />
                </svg>
                <span className="ml-3 inline-block rounded bg-ember px-1.5 py-0.5 text-[0.6rem] font-semibold text-ink">You</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Eyebrow + two-tone heading used inside light sections ("01 · The brief" style). */
export function Eyebrow({ index, label, tone = "dark" }: { index?: string; label: string; tone?: "dark" | "light" }) {
  return (
    <p data-anim="fade-up" className={`eyebrow ${tone === "dark" ? "text-ink/50" : "text-white/60"}`}>
      {index && <span className="mr-2">{index} ·</span>}
      {label}
    </p>
  );
}

/** Case-study card for /work, services and case pages. Uses the live case-study cover image. */
export function CaseCard({
  study,
  size = "md",
  priority = false,
  reveal = true,
}: {
  study: CaseStudy;
  size?: "lg" | "md";
  priority?: boolean;
  /** Wipe the cover open on scroll. Off where the card's container runs its own reveal (e.g. /work's client grid). */
  reveal?: boolean;
}) {
  return (
    <Link
      href={caseStudyHref(study.slug)}
      data-card
      data-tilt
      data-flip-id={study.slug}
      className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-mist p-2 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,.35)]"
    >
      <div data-anim={reveal ? "media" : undefined} className={`relative overflow-hidden rounded-[0.9rem] bg-ink ${size === "lg" ? "aspect-[16/11]" : "aspect-[4/3]"}`}>
        {study.cover && (
          <div className="absolute inset-0 transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.05]">
          <Image
            src={study.cover}
            unoptimized={isUploaded(study.cover)}
            alt={`${study.client} — ${study.title}`}
            fill
            priority={priority}
            sizes={size === "lg" ? "(min-width: 1024px) 600px, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
            className="object-cover"
          />
          </div>
        )}
        {study.concept && (
          <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-ink">
            Concept tweak
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className={`font-semibold tracking-[-0.03em] ${size === "lg" ? "text-2xl" : "text-xl"}`}>{study.client}</h3>
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[radial-gradient(120%_140%_at_80%_0%,#ff8a3d_0%,#c2410c_45%,#1a0b05_100%)] text-white transition-transform duration-500 ease-out-expo group-hover:rotate-45">
            <Arrow className="size-3.5" />
          </span>
        </div>
        {study.metric && (
          <p className="mt-1 text-[0.72rem] font-semibold text-flame">
            {study.metric.value} {study.metric.label}
          </p>
        )}
        <p className="mt-1.5 text-[0.8rem] leading-snug text-subtle">{study.title}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {study.categories.map((c) => (
            <li key={c} className="rounded-md border border-line bg-white px-2 py-0.5 text-[0.65rem] font-medium">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
