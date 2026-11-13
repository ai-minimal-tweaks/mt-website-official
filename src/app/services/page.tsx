import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Faq } from "@/components/home/Faq";
import { CtaBand, GlassOrbs, PageHero, SelectWord } from "@/components/shared";
import { Arrow, Pill, SectionHeading } from "@/components/ui";
import { GradientField } from "@/components/three/GradientField";
import { faqs } from "@/content/home";
import { getCaseStudy } from "@/content/case-studies";
import { engagements, pillars, processSteps } from "@/content/services";

export const metadata: Metadata = {
  title: "Creativity and Technology Services",
  description:
    "Three ways we tweak brands: creative thinking, creative scale and brand content. A creative agency first — we pick the tools, including AI, that suit each brief.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <main>
        <PageHero className="min-h-[34rem] sm:min-h-[38rem]">
          <h1 data-anim="lines" className="text-display font-medium tracking-[-0.045em]">
            <span className="line-mask">
              <span>Three ways</span>
            </span>
            <span className="line-mask pt-[0.06em]">
              <span>
                <em className="font-serif font-light italic tracking-[-0.03em]">we</em> <SelectWord>tweak</SelectWord>{" "}
                <em className="font-serif font-light italic tracking-[-0.03em]">brands.</em>
              </span>
            </span>
          </h1>
          <ul data-anim="fade-up" className="mt-9 flex flex-wrap justify-center gap-2">
            {pillars.map((p, i) => (
              <li key={p.id}>
                <a
                  href={`#${p.id}`}
                  className="inline-flex h-9 items-center rounded-full border border-white/20 bg-white/10 px-4 text-xs font-medium backdrop-blur transition hover:bg-white hover:text-ink"
                >
                  {String(i + 1).padStart(2, "0")} {p.title.join(" ")}
                </a>
              </li>
            ))}
          </ul>
        </PageHero>

        <section className="py-16 sm:py-24" aria-labelledby="pillars-title">
          <div className="container-site">
            <div id="pillars-title" className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading lead="What we do." accent="In detail." />
              <p data-anim="words" className="max-w-xs font-serif text-[1.05rem] leading-snug text-subtle md:text-right">
                A creative agency first. We pick the tools, including AI, that suit each brief.
              </p>
            </div>

            <div className="mt-12 space-y-8">
              {pillars.map((p, i) => {
                const related = getCaseStudy(p.related);
                return (
                  <article key={p.id} id={p.id} data-anim="camera" className="relative scroll-mt-28 pt-6">
                    {/* Folder tab, as on the homepage idea cards */}
                    <div aria-hidden className="absolute left-0 top-0 h-7 w-56 max-w-[60%] rounded-t-[1rem] bg-mist [clip-path:polygon(0_0,86%_0,100%_100%,0_100%)]" />
                    <div className="grid gap-10 rounded-b-[1.4rem] rounded-tr-[1.4rem] bg-mist p-6 sm:p-10 md:grid-cols-[1fr_1.15fr]">
                      <div>
                        <p className="eyebrow text-[0.62rem] text-ink/45">{String(i + 1).padStart(2, "0")} · Pillar</p>
                        <h2 className="mt-5 text-[clamp(2.2rem,1.6rem+2vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                          {p.title[0]}
                          <br />
                          {p.title[1]}
                        </h2>
                        <p className="mt-5 max-w-[14rem] font-serif text-lg leading-snug text-subtle">{p.tagline}</p>
                      </div>
                      <div>
                        <div className="flex items-start justify-between">
                          <p className="eyebrow text-[0.62rem] text-ink/45">What&apos;s included</p>
                          <span aria-hidden className="flex gap-1">
                            <i className="size-2 rounded-full bg-[#ff5f57]" />
                            <i className="size-2 rounded-full bg-[#febc2e]" />
                            <i className="size-2 rounded-full bg-[#28c840]" />
                          </span>
                        </div>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {p.included.map((c) => (
                            <li key={c} className="rounded-full bg-white px-3 py-1.5 text-[0.72rem] font-medium shadow-[0_4px_12px_-8px_rgba(0,0,0,.4)]">
                              {c}
                            </li>
                          ))}
                        </ul>
                        <p className="eyebrow mt-7 text-[0.62rem] text-ink/45">Deliverables</p>
                        <ul className="mt-2 divide-y divide-ink/10">
                          {p.deliverables.map((d) => (
                            <li key={d} className="flex items-center gap-3 py-3 text-sm">
                              <span aria-hidden className="size-1.5 rounded-full bg-flame" />
                              {d}
                            </li>
                          ))}
                        </ul>
                        {related && (
                          <Link href={`/case-studies/${related.slug}`} className="group mt-6 flex items-center gap-4 rounded-xl bg-white p-2 pr-5">
                            <span className="relative block h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-ink">
                              <Image src={related.cover} alt="" fill sizes="80px" className="object-cover" />
                            </span>
                            <span className="flex-1">
                              <span className="block text-[0.62rem] text-muted">Related case</span>
                              <span className="block font-semibold">{related.client}</span>
                            </span>
                            <Arrow className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* The three pillars, sliding past as oversized type */}
        <div aria-hidden className="overflow-hidden pb-14 sm:pb-20">
          <p data-anim="drift" data-speed="-30" className="whitespace-nowrap text-[clamp(3.5rem,10vw,9rem)] font-semibold leading-none tracking-[-0.055em] text-ink/[0.07]">
            {[...pillars, ...pillars].map((p, i) => (
              <span key={i}>
                {p.title.join(" ")} <em className="font-serif font-light text-ember/60">·</em>{" "}
              </span>
            ))}
          </p>
        </div>

        <section className="pb-16 sm:pb-24" aria-labelledby="process-title">
          <div className="container-site">
            <div id="process-title">
              <SectionHeading lead="How we tweak." accent="Four steps, every time." />
            </div>
            <ol data-anim="stagger" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((s, i) => (
                <li key={s.title} data-anim-item className="rounded-[1.25rem] bg-mist p-6">
                  <span className="grid size-9 place-items-center rounded-md bg-ink text-xs font-bold text-white">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.04em]">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-subtle">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-2 sm:px-3" aria-labelledby="ways-title">
          <div data-anim="camera" className="relative isolate overflow-hidden rounded-[1.5rem] bg-ink py-16 text-white sm:rounded-shell sm:py-24">
            <GradientField bias={[0.05, 0.05]} />
            <GlassOrbs />
            <div className="container-site relative">
              <h2 id="ways-title" data-anim="lines" className="text-heading font-medium tracking-[-0.04em]">
                <span className="line-mask">
                  <span className="text-white/60">Ways to work</span>
                </span>
                <span className="line-mask">
                  <span className="accent">with us.</span>
                </span>
              </h2>
              <div data-anim="stagger" className="mt-12 grid gap-4 md:grid-cols-3">
                {engagements.map((e) => (
                  <article
                    key={e.name}
                    data-anim-item
                    className={`liquid-glass relative rounded-[1.25rem] p-6 sm:p-7 ${e.highlight ? "ring-1 ring-ember/70" : ""}`}
                  >
                    <p className="eyebrow text-[0.6rem] text-white/50">{e.bestFor}</p>
                    <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">{e.name}</h3>
                    <p className="mt-4 font-serif text-lg leading-snug text-white/75">{e.body}</p>
                    <ul className="mt-6 space-y-2.5">
                      {e.points.map((pt) => (
                        <li key={pt} className="flex items-center gap-3 text-sm text-white/85">
                          <span aria-hidden className="size-1.5 rounded-full bg-ember" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
              <div data-anim="fade-up" className="mt-10 flex flex-wrap gap-3">
                <Pill href="/contact" variant="flame">
                  Start a project
                </Pill>
                <Pill href="/contact#discovery-call" variant="glass">
                  Book a discovery call
                </Pill>
              </div>
            </div>
          </div>
        </section>

        <Faq items={faqs.filter((f) => !f.q.startsWith("Is Webflow"))} />

        <CtaBand
          lead="Not sure which"
          accent="fits your brand?"
          body="Book a 30-minute discovery call. We'll listen first, then suggest the simplest way to start."
        />
      </main>
      <Footer />
    </>
  );
}
