import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { CtaBand, PageHero } from "@/components/shared";
import { Arrow, SectionHeading } from "@/components/ui";
import { caseStudyHref } from "@/content/case-studies";
import { getCaseStudies } from "@/lib/cms/store";
import type { CaseStudy } from "@/content/case-studies";
import { testimonials, trustedBrands, type Testimonial } from "@/content/testimonials";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Real words from the people who make our work worthwhile — how our creative ideas and thoughtful design changed things for their brands.",
  alternates: { canonical: "/testimonials" },
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("");

function Author({ t }: { t: Testimonial }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#d9a27a] to-[#6b3d22] text-sm font-semibold text-white">
        {initials(t.name)}
      </span>
      <span>
        <span className="block text-sm font-semibold">{t.name}</span>
        <span className="block text-xs text-subtle">{t.role}</span>
      </span>
    </div>
  );
}

export default async function TestimonialsPage() {
  const [featured, ...rest] = testimonials;
  const studies = await getCaseStudies();
  const findStudy = (slug?: string) => (slug ? studies.find((c) => c.slug === slug) : undefined);
  const featuredCase = findStudy(featured.caseSlug);

  return (
    <>
      <main>
        <PageHero align="left" bias={[0.05, 0.15]}>
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <h1 data-anim="lines" className="text-[clamp(2.5rem,1.2rem+4.2vw,4.75rem)] font-medium leading-[1.02] tracking-[-0.045em]">
              <span className="line-mask">
                <span className="text-white/55">Small Tweaks, Big Love,</span>
              </span>
              <span className="line-mask">
                <span className="font-serif font-light italic tracking-[-0.03em]">Lasting Impressions</span>
              </span>
            </h1>
            <p data-anim="fade-up" className="max-w-sm font-serif text-[1.05rem] leading-snug text-white/85 md:justify-self-end md:text-right">
              Real words from the people who make our work worthwhile. Hear how our creative ideas and thoughtful design have
              made a difference to their brands.
            </p>
          </div>
        </PageHero>

        <section className="container-site py-16 sm:py-24" aria-label="Featured testimonial">
          <figure data-anim="camera" className="rounded-[1.5rem] bg-mist p-6 sm:p-12">
            <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold">★ 5.0</span>
            <blockquote data-anim="words" className="mt-8 max-w-3xl font-serif text-[clamp(1.4rem,1.1rem+1.1vw,2rem)] leading-[1.45] text-ink">
              “{featured.quote}”
            </blockquote>
            <figcaption className="mt-10 flex flex-col gap-6 border-t border-ink/10 pt-6 md:flex-row md:items-center md:justify-between">
              <Author t={featured} />
              {featured.result && (
                <p className="flex items-center gap-2 text-sm font-semibold text-flame">
                  <span aria-hidden className="size-1.5 rounded-full bg-flame" />
                  {featured.result}
                </p>
              )}
              {featuredCase && (
                <Link href={caseStudyHref(featuredCase.slug)} className="group flex items-center gap-4 rounded-xl bg-white p-2 pr-5">
                  <span className="relative block h-14 w-20 overflow-hidden rounded-lg bg-ink">
                    <Image src={featuredCase.cover} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block text-[0.62rem] text-muted">{featuredCase.service}</span>
                    <span className="block text-sm font-semibold">View {featured.brand} case</span>
                  </span>
                  <Arrow className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              )}
            </figcaption>
          </figure>
        </section>

        <section className="container-site pb-16 sm:pb-24" aria-labelledby="more-title">
          <div id="more-title">
            <SectionHeading lead="More words" accent="from the brands." />
          </div>
          {/* CSS columns give the design's masonry without JS */}
          <div data-anim="stagger" className="mt-10 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3">
            {rest.slice(0, 3).map((t) => (
              <Quote key={t.name} t={t} study={findStudy(t.caseSlug)} />
            ))}
            <a
              data-anim-item
              href={site.showreel}
              target="_blank"
              rel="noopener noreferrer"
              className="group mb-4 block break-inside-avoid rounded-[1.25rem] bg-ink p-3 text-white"
            >
              <span className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[0.9rem] bg-[radial-gradient(70%_70%_at_70%_30%,#c2410c_0%,#1a0b05_70%)]">
                <span className="grid size-14 place-items-center rounded-xl bg-flame shadow-lg transition-transform duration-500 group-hover:scale-110">
                  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
                    <path d="M8 5.5v13l11-6.5z" />
                  </svg>
                </span>
              </span>
              <span className="block px-2 pb-2 pt-4">
                <span className="block text-sm font-semibold">How we tweak</span>
                <span className="block text-xs text-white/60">Watch the Minimal Tweaks showreel on YouTube</span>
              </span>
            </a>
            {rest.slice(3).map((t) => (
              <Quote key={t.name} t={t} study={findStudy(t.caseSlug)} />
            ))}
          </div>
        </section>

        <section className="container-site" aria-labelledby="brands-title">
          <p id="brands-title" data-anim="fade-up" className="eyebrow text-ink/50">
            Brands that trust us
          </p>
          <ul data-anim="stagger" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {trustedBrands.map((b) => (
              <li key={b} data-anim-item className="grid h-16 place-items-center rounded-xl bg-mist px-3 text-center text-sm font-semibold text-ink/55">
                {b}
              </li>
            ))}
          </ul>
        </section>

        <CtaBand
          lead="Want to be"
          accent="our next story?"
          body="Tell us where the brand is today and where you want it to be. We'll come back with a plan for the first few weeks."
        />
      </main>
      <Footer />
    </>
  );
}

function Quote({ t, study }: { t: Testimonial; study?: CaseStudy }) {
  return (
    <figure data-anim-item className="mb-4 break-inside-avoid rounded-[1.25rem] bg-mist p-6">
      <span className="rounded-md bg-white px-2 py-0.5 text-[0.65rem] font-semibold">★ 5.0</span>
      <blockquote className="mt-5 font-serif text-[1.05rem] leading-relaxed text-ink">“{t.quote}”</blockquote>
      {t.result && (
        <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-flame">
          <span aria-hidden className="size-1.5 rounded-full bg-flame" />
          {t.result}
        </p>
      )}
      <figcaption className="mt-6 flex items-center justify-between gap-3">
        <Author t={t} />
        {study && (
          <Link href={caseStudyHref(study.slug)} aria-label={`Read the ${t.brand} case study`} className="grid size-8 place-items-center rounded-lg bg-white transition hover:bg-ink hover:text-white">
            <Arrow className="size-3.5" />
          </Link>
        )}
      </figcaption>
    </figure>
  );
}
