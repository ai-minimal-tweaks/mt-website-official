import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Pill } from "@/components/ui";

const TEAM_PHOTO = "/images/team.jpg";
const hasTeamPhoto = fs.existsSync(path.join(process.cwd(), "public", TEAM_PHOTO));

export function About() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28" aria-labelledby="about-title">
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-24 size-[30rem] rounded-full bg-peach blur-[110px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 size-[30rem] rounded-full bg-peach blur-[110px]" />

      <div className="container-site relative">
        <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="about-title" data-anim="lines" className="text-heading font-medium tracking-[-0.04em]">
            <span className="line-mask">
              <span>
                Discover <span className="accent text-ember">Who We Are</span> and
              </span>
            </span>
            <span className="line-mask">
              <span>What Drives Us Forward</span>
            </span>
          </h2>
          <div data-anim="fade-up" className="shrink-0">
            <Pill href="/about">Explore our story</Pill>
          </div>
        </div>

        {/* Desktop frame matches the 3.3:1 photo so the whole team stays in shot; phones use a taller
            frame and pan across the photo while scrolling (data-anim="pan"). */}
        <figure data-anim="clip" className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-ink sm:aspect-[3.4/1]">
          <div data-anim="parallax" data-speed="-8" className="absolute -inset-y-[5%] inset-x-0" {...(hasTeamPhoto && { "data-anim-pan": "" })}>
            {hasTeamPhoto ? (
              <Image
                src={TEAM_PHOTO}
                alt="The Minimal Tweaks team in their “The secret of getting ahead starts with a minimal tweak” T-shirts"
                fill
                sizes="(min-width: 1312px) 1200px, 100vw"
                className="object-cover"
              />
            ) : (
              <TeamPlaceholder />
            )}
          </div>
          <div aria-hidden className="absolute left-[54%] top-[56%] motion-safe:animate-[float_6s_ease-in-out_infinite]">
            <svg viewBox="0 0 16 16" className="size-5 -rotate-12 text-sky-500 drop-shadow" fill="currentColor">
              <path d="M2 1l12 6-5.2 1.3L6.5 14z" />
            </svg>
            <span className="ml-4 inline-block rounded-md bg-sky-500 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">Minimal Tweaks</span>
          </div>
        </figure>

        <div className="mt-10 max-w-3xl space-y-5 font-serif text-[1.08rem] leading-relaxed text-subtle sm:text-xl">
          <p data-anim="words">
            We work with <strong className="font-semibold italic text-ink">top 1% consumer brands</strong> that have a lot to create.
            From products, constant campaigns, multiple platforms and markets, and an ever-growing need for good creative.
          </p>
          <p data-anim="words">
            Getting ahead doesn&apos;t always require a reinvention. Sometimes, the right creative thought, a sharper idea, a
            different perspective, a smarter execution is enough to change the outcome.
          </p>
        </div>
      </div>
    </section>
  );
}

function TeamPlaceholder() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_30%_20%,#3a1d7a_0%,#120a2a_55%,#050308_100%)]">
      <div className="absolute inset-x-0 top-[12%] flex justify-center gap-10 text-white/80">
        {["Minimal Tweaks", "Minimal Tweaks"].map((t, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex size-6 items-center justify-center whitespace-nowrap rounded bg-navy text-[0.55rem]">
              M<span className="text-ember">T</span>
            </span>
            {t}
          </span>
        ))}
      </div>
      <div className="absolute inset-x-[6%] bottom-[8%] flex h-[62%] items-end justify-center gap-[1.5%]">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="block rounded-t-full bg-gradient-to-b from-[#26262b] to-[#0b0b0d]"
            style={{ width: "6.5%", height: `${52 + ((i * 37) % 22)}%` }}
          />
        ))}
      </div>
      <p className="absolute bottom-[10%] right-[5%] text-[0.65rem] uppercase tracking-widest text-white/40">Team photo · add public/images/team.jpg</p>
    </div>
  );
}
