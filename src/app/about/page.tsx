import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/components/layout/Footer";
import { GlassOrbs, PageHero, SelectWord } from "@/components/shared";
import { Pill, SectionHeading } from "@/components/ui";
import { GradientField } from "@/components/three/GradientField";
import { aboutStory, collaborations, mission, trustedSince, values } from "@/content/about";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us — The Tweakers",
  description:
    "Two childhood friends left their IT careers to tweak how brands do marketing and design. Meet the tweaky family behind Minimal Tweaks — our story, mission and values.",
  alternates: { canonical: "/about" },
};

const TEAM_PHOTO = "/images/team.jpg";
const hasTeamPhoto = fs.existsSync(path.join(process.cwd(), "public", TEAM_PHOTO));

/** Cursor + name tag, the Figma-collaborator motif used across the site. */
function CursorTag({ label, tone = "ember", className = "" }: { label: string; tone?: "ember" | "sky"; className?: string }) {
  const color = tone === "ember" ? "text-ember" : "text-sky-500";
  const bg = tone === "ember" ? "bg-ember text-ink" : "bg-sky-500 text-white";
  return (
    <div aria-hidden className={`pointer-events-none absolute motion-safe:animate-[float_7s_ease-in-out_infinite] ${className}`}>
      <svg viewBox="0 0 16 16" className={`size-5 -rotate-12 drop-shadow ${color}`} fill="currentColor">
        <path d="M2 1l12 6-5.2 1.3L6.5 14z" />
      </svg>
      <span className={`ml-4 inline-block whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold shadow-lg ${bg}`}>{label}</span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <main>
        <PageHero className="min-h-[36rem] sm:min-h-[42rem]" bias={[0.08, -0.04]}>
          <p data-anim="fade-up" className="eyebrow text-white/70">
            About us <span className="text-white/40">· The tweakers</span>
          </p>
          <h1 data-anim="lines" className="mt-6 text-display font-medium tracking-[-0.045em]">
            <span className="line-mask">
              <span>Playing off each other&apos;s</span>
            </span>
            <span className="line-mask">
              <span>
                <em className="font-serif font-light italic tracking-[-0.03em]">strengths</em> to build the
              </span>
            </span>
            <span className="line-mask pt-[0.06em]">
              <span>
                <SelectWord>tweaky</SelectWord> family.
              </span>
            </span>
          </h1>
          <div data-anim="fade-up" className="mt-9 flex flex-wrap justify-center gap-3">
            <Pill href={site.showreel} external variant="glass">
              Watch our showreel
            </Pill>
            <Pill href="/work" variant="light">
              See our work
            </Pill>
          </div>
        </PageHero>

        {/* The family — full team photo, opening like a camera iris */}
        {hasTeamPhoto && (
          <section className="container-site pt-14 sm:pt-20" aria-label="The Minimal Tweaks team">
            <figure data-anim="clip" className="relative aspect-[16/11] overflow-hidden rounded-[1.25rem] bg-ink sm:aspect-[3/1]">
              <div data-anim="parallax" data-speed="-10" className="absolute -inset-y-[6%] inset-x-0" data-anim-pan="">
                <Image
                  src={TEAM_PHOTO}
                  alt="The Minimal Tweaks team together in their “The secret of getting ahead starts with a minimal tweak” T-shirts"
                  fill
                  sizes="(min-width: 1312px) 1200px, 100vw"
                  className="object-cover"
                />
              </div>
              <CursorTag label="The tweaky family" tone="sky" className="left-[46%] top-[58%]" />
            </figure>
          </section>
        )}

        {/* 01 · How it started */}
        <section className="relative overflow-hidden py-20 sm:py-28" aria-labelledby="story-title">
          <div aria-hidden className="pointer-events-none absolute -left-40 top-10 size-[28rem] rounded-full bg-peach blur-[110px]" />
          <div className="container-site relative grid items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
            <figure data-anim="clip" className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(90%_80%_at_70%_100%,#ffd9b8_0%,#fff1e3_45%,#f3f3f2_100%)]">
              <div aria-hidden className="dot-grid absolute inset-0 text-ink/10 [mask-image:radial-gradient(70%_60%_at_30%_30%,#000,transparent)]" />
              <div data-anim="parallax" data-speed="-6" className="absolute inset-0">
                <Image
                  src="/images/about/founders.webp"
                  alt={`Co-founders ${aboutStory.founders}`}
                  fill
                  sizes="(min-width: 768px) 55vw, 100vw"
                  className="object-cover object-[78%_100%]"
                />
              </div>
              <CursorTag label={`${aboutStory.founders} · Co-founders`} className="left-[8%] top-[14%]" />
            </figure>

            <div>
              <p data-anim="fade-up" className="eyebrow text-ink/50">
                01 · <span className="text-muted">How it started</span>
              </p>
              <h2 id="story-title" data-anim="lines" className="mt-5 text-heading font-medium tracking-[-0.04em]">
                <span className="line-mask">
                  <span className="text-muted">Two childhood friends.</span>
                </span>
                <span className="line-mask">
                  <span className="accent">One minimal tweak.</span>
                </span>
              </h2>
              <div className="mt-7 space-y-5 font-serif text-[1.1rem] leading-relaxed text-ink sm:text-xl">
                {aboutStory.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)} data-anim="words">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 02 · Mission — dark band that swings up into frame, with the dart rider flying across */}
        <section className="px-2 sm:px-3" aria-labelledby="mission-title">
          <div data-anim="camera" className="relative isolate overflow-hidden rounded-[1.5rem] bg-ink text-white sm:rounded-shell">
            <GradientField bias={[-0.05, 0.12]} intensity={0.9} />
            <GlassOrbs />
            <div className="container-site relative z-10 py-20 sm:py-28">
              <p id="mission-title" data-anim="fade-up" className="eyebrow text-white/60">
                02 · <span className="text-white/40">Our mission</span>
              </p>
              <p
                data-anim="words"
                className="mt-8 max-w-5xl text-[clamp(1.75rem,1.1rem+2.7vw,3.6rem)] font-medium leading-[1.08] tracking-[-0.04em]"
              >
                {mission.statement}
              </p>
              <div className="relative mt-10 h-40 sm:mt-6 sm:h-64 lg:h-72">
                <div data-anim="drift" data-speed="55" className="absolute -left-[10%] top-0 h-full w-[85%] sm:w-[55%] lg:w-[45%]">
                  <Image src="/images/about/mission-dart.webp" alt="" fill sizes="(min-width: 1024px) 45vw, 85vw" className="object-contain" />
                </div>
              </div>
              <p data-anim="fade-up" className="ml-auto max-w-md font-serif text-lg leading-snug text-white/85 sm:text-right sm:text-xl">
                {mission.closer}
              </p>
            </div>
          </div>
        </section>

        {/* Values on a sliding marquee of type */}
        <div aria-hidden className="overflow-hidden py-14 sm:py-20">
          <p data-anim="drift" data-speed="-30" className="whitespace-nowrap text-[clamp(3.5rem,10vw,9rem)] font-semibold leading-none tracking-[-0.055em] text-ink/[0.07]">
            {values.map((v) => (
              <span key={v.title}>
                {v.title} <em className="font-serif font-light text-ember/60">·</em>{" "}
              </span>
            ))}
          </p>
        </div>

        {/* 03 · Values — pinned sideways scroll on desktop, a swipe row on phones */}
        <section data-anim="hscroll" className="overflow-hidden pb-16 sm:pb-24 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:pb-0" aria-labelledby="values-title">
          <div
            data-hscroll-track
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[clamp(1.25rem,4vw,3.5rem)] pb-4 [scrollbar-width:none] sm:gap-5 lg:w-max lg:snap-none lg:overflow-visible lg:pb-0"
          >
            <div className="flex w-[80vw] shrink-0 snap-start flex-col justify-end pb-2 sm:w-[24rem] lg:w-[30rem]">
              <p data-anim="fade-up" className="eyebrow text-ink/50">
                03 · <span className="text-muted">Our values</span>
              </p>
              <h2 id="values-title" data-anim="lines" className="mt-5 text-[clamp(2.4rem,1.6rem+3vw,4.4rem)] font-medium leading-[1.02] tracking-[-0.045em]">
                <span className="line-mask">
                  <span className="text-muted">What humanizes</span>
                </span>
                <span className="line-mask">
                  <span className="accent">Minimal Tweaks?</span>
                </span>
              </h2>
              <p data-anim="fade-up" className="mt-5 hidden max-w-xs font-serif text-lg leading-snug text-subtle lg:block">
                Keep scrolling — five things we won&apos;t tweak.
              </p>
            </div>
            {values.map((v, i) => {
              const hot = i === 2;
              return (
                <article
                  key={v.title}
                  data-hscroll-item
                  className={`relative flex h-[24rem] w-[78vw] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[1.5rem] p-6 sm:h-[26rem] sm:w-[21rem] lg:h-[30rem] lg:w-[25rem] lg:p-8 ${
                    hot ? "bg-[radial-gradient(120%_120%_at_85%_0%,#ff8a3d_0%,#c2410c_45%,#1a0b05_100%)] text-white" : "bg-mist"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-[4.5rem] font-medium leading-none tracking-[-0.06em] ${hot ? "text-white/30" : "text-ink/10"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden className="flex gap-1">
                      <i className="size-2 rounded-full bg-[#ff5f57]" />
                      <i className="size-2 rounded-full bg-[#febc2e]" />
                      <i className="size-2 rounded-full bg-[#28c840]" />
                    </span>
                  </div>
                  <div
                    className="relative mx-auto h-32 w-44 motion-safe:animate-[float_8s_ease-in-out_infinite] lg:h-40 lg:w-56"
                    style={{ animationDelay: `${i * -1.4}s` }}
                  >
                    <Image src={v.icon} alt="" fill sizes="224px" className="object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,.25)]" />
                  </div>
                  <h3 className="text-[2.1rem] font-semibold leading-[0.95] tracking-[-0.045em] lg:text-[2.5rem]">{v.title}</h3>
                </article>
              );
            })}
          </div>
        </section>

        {/* 04 · Collaborations */}
        <section className="py-16 sm:py-24" aria-labelledby="clients-title">
          <div className="container-site">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div id="clients-title">
                <SectionHeading lead="Some of our" accent="fruitful collaborations." />
              </div>
              <p data-anim="fade-up" className="font-serif text-lg leading-snug text-subtle md:text-right">
                They have trust in our tweaks
                <br />
                since{" "}
                <span data-anim="count" data-from={trustedSince - 12} data-value={trustedSince} className="font-sans text-[2.6rem] font-medium tracking-[-0.05em] text-ink">
                  {trustedSince}
                </span>
              </p>
            </div>
            <ul data-anim="stagger" className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {collaborations.map((c) => (
                <li
                  key={c.name}
                  data-anim-item
                  className="group relative grid h-28 place-items-center overflow-hidden rounded-[1.1rem] border border-line bg-white px-5 transition-shadow duration-500 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,.35)] sm:h-32"
                >
                  <span className="relative block h-14 w-full">
                    <Image
                      src={c.logo}
                      alt={c.name}
                      fill
                      sizes="(min-width: 1024px) 180px, 45vw"
                      className="object-contain grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Let's find the missing piece */}
        <section className="pb-16 sm:pb-24" aria-labelledby="piece-title">
          <div className="container-site">
            <div data-anim="camera" className="relative grid items-center gap-6 overflow-hidden rounded-[1.5rem] bg-mist px-6 pt-12 sm:px-12 md:grid-cols-[1.1fr_1fr] md:py-16">
              <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-peach blur-[90px]" />
              <div className="relative">
                <h2 id="piece-title" data-anim="lines" className="text-heading font-medium tracking-[-0.04em]">
                  <span className="line-mask">
                    <span className="text-muted">Let&apos;s find</span>
                  </span>
                  <span className="line-mask">
                    <span className="accent">the missing piece.</span>
                  </span>
                </h2>
                <p data-anim="fade-up" className="mt-5 max-w-md font-serif text-[1.08rem] leading-snug text-subtle">
                  Now is the right time to pivot your digital strategy. Let&apos;s start discussing within minutes!
                </p>
                <div data-anim="fade-up" className="mt-7 flex flex-wrap gap-3">
                  <Pill href="/contact" variant="flame">
                    Free consultation
                  </Pill>
                  <Pill href="/work" variant="outline">
                    View case studies
                  </Pill>
                </div>
              </div>
              <div data-anim="parallax" data-speed="-14" className="relative -mb-4 aspect-[1322/1126] w-full md:mb-0">
                <div className="absolute inset-0 motion-safe:animate-[float_9s_ease-in-out_infinite]">
                  <Image src="/images/about/puzzle.webp" alt="" fill sizes="(min-width: 768px) 40vw, 90vw" className="object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
