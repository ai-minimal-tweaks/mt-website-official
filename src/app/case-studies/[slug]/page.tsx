import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { RichBlocks } from "@/components/case/RichBlocks";
import { CtaBand, GlassOrbs, PageHero } from "@/components/shared";
import { Arrow } from "@/components/ui";
import { GradientField } from "@/components/three/GradientField";
import { caseStudies, getCaseStudy, imagesOf, nextCaseStudy } from "@/content/case-studies";
import { testimonials } from "@/content/testimonials";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

// Every case-study URL from the live site is pre-rendered; anything else 404s.
export const dynamicParams = false;
export const generateStaticParams = () => caseStudies.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const study = getCaseStudy((await params).slug);
  if (!study) return {};
  return {
    title: { absolute: study.metaTitle || `${study.client}: ${study.title}` },
    description: study.description,
    alternates: { canonical: `/case-studies/${study.slug}` },
    openGraph: { type: "article", images: study.cover ? [study.cover] : undefined },
  };
}

function SectionTitle({ index, label, lead, accent, tone = "dark" }: { index: string; label: string; lead: string; accent: string; tone?: "dark" | "light" }) {
  return (
    <div>
      <p data-anim="fade-up" className={`eyebrow ${tone === "dark" ? "text-ink/50" : "text-white/60"}`}>
        {index} · {label}
      </p>
      <h2 data-anim="lines" className="mt-4 text-[clamp(1.8rem,1.2rem+2vw,2.9rem)] font-medium leading-[1.05] tracking-[-0.04em]">
        <span className="line-mask">
          <span className={tone === "dark" ? "text-muted" : "text-white/60"}>{lead}</span>
        </span>
        <span className="line-mask">
          <span className="accent">{accent}</span>
        </span>
      </h2>
    </div>
  );
}

export default async function CaseStudyPage({ params }: Props) {
  const study = getCaseStudy((await params).slug);
  if (!study) notFound();

  const images = imagesOf(study);
  const approachImage = images[0];
  const approachSrc = approachImage?.src ?? study.cover;
  const gallery = images.slice(1);
  const steps = study.solution.filter((b) => b.type === "li");
  const solutionIntro = study.solution.filter((b) => b.type !== "li");
  const quote = testimonials.find((t) => t.caseSlug === study.slug) ?? testimonials.find((t) => t.brand === study.client);
  const next = nextCaseStudy(study.slug);

  const facts = [
    ["Client", study.client],
    ["Industry", study.industry],
    ["Services", study.service || study.categories.join(", ")],
    ["Focus", study.categories.join(", ")],
    ["Type", study.concept ? "Concept tweak (self-initiated)" : "Client work"],
  ];

  return (
    <>
      <main>
        <PageHero align="left" bias={[0.1, 0.1]}>
          <ul data-anim="fade-up" className="flex flex-wrap gap-2">
            {["Case study", ...study.categories].map((t) => (
              <li key={t} className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[0.68rem] font-medium backdrop-blur">
                {t}
              </li>
            ))}
          </ul>
          <h1 data-anim="lines" className="mt-6 max-w-4xl text-[clamp(2.4rem,1.3rem+4.4vw,5rem)] font-medium leading-[1.02] tracking-[-0.045em]">
            <span className="line-mask">
              <span>{study.client}</span>
            </span>
            <span className="line-mask">
              <span className="font-serif font-light italic tracking-[-0.03em] text-white/90">{study.title}.</span>
            </span>
          </h1>
          {study.cover && (
            <div data-anim="clip" className="relative mt-10 aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-white/5 sm:mt-14 sm:aspect-[16/8]">
              <div data-anim="parallax" data-speed="-8" className="absolute -inset-y-[5%] inset-x-0">
                <Image src={study.cover} alt={`${study.client} — ${study.title}`} fill priority sizes="(min-width: 1312px) 1200px, 100vw" className="object-cover" />
              </div>
            </div>
          )}
        </PageHero>

        <section className="container-site pt-12 sm:pt-16" aria-label="Project facts">
          <dl data-anim="stagger" className="grid grid-cols-2 gap-x-6 gap-y-6 border-b border-line pb-10 sm:grid-cols-3 lg:grid-cols-5">
            {facts.map(([k, v]) => (
              <div key={k} data-anim-item>
                <dt className="eyebrow text-[0.6rem] text-ink/45">{k}</dt>
                <dd className="mt-2 font-serif text-[1.02rem] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="container-site grid gap-8 py-16 sm:py-24 md:grid-cols-2 md:gap-16">
          <SectionTitle index="01" label="The brief" lead="The brief." accent="What they came in with." />
          <div data-anim="fade-up">
            <RichBlocks blocks={study.brief} className="text-ink/85" />
          </div>
        </section>

        <section className="container-site grid items-center gap-10 pb-16 sm:pb-24 md:grid-cols-2 md:gap-16">
          <div data-anim="clip" className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-mist">
            {approachSrc && (
              <Image
                src={approachSrc}
                alt={approachImage?.alt || `${study.client} — approach`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
          <div>
            <SectionTitle index="02" label="Our approach" lead="Our approach." accent="The idea behind the work." />
            <div data-anim="fade-up" className="mt-6">
              <RichBlocks blocks={study.approach} />
              <ul className="mt-6 flex gap-2">
                {["Insight", "Idea", "Execution"].map((t) => (
                  <li key={t} className="rounded-md bg-mist px-2.5 py-1 text-[0.7rem] font-semibold">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="px-2 sm:px-3" aria-labelledby="process-title">
          <div data-anim="camera" className="relative isolate overflow-hidden rounded-[1.5rem] bg-ink py-16 text-white sm:rounded-shell sm:py-24">
            <GradientField bias={[0.15, 0.1]} intensity={0.9} />
            <GlassOrbs />
            <div className="container-site relative">
              <div id="process-title" className="grid gap-6 md:grid-cols-2 md:items-end">
                <SectionTitle index="03" label="Process" lead="Process." accent="How the tweak happened." tone="light" />
                {solutionIntro.length > 0 && <RichBlocks blocks={solutionIntro} tone="light" className="md:justify-self-end md:max-w-md" />}
              </div>
              {steps.length > 0 && (
                <ol data-anim="stagger" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {steps.map((s, i) => (
                    <li key={i} data-anim-item className="rounded-[1.1rem] bg-white p-5 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,.8)]">
                      <span className="grid size-8 place-items-center rounded-md bg-ember text-xs font-bold">{String(i + 1).padStart(2, "0")}</span>
                      <p className="mt-6 text-sm leading-relaxed text-subtle">{s.type === "li" && s.text}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </section>

        {gallery.length > 0 && (
          <section className="container-site py-16 sm:py-24" aria-labelledby="work-title">
            <div id="work-title">
              <SectionTitle index="04" label="Work showcase" lead="The work," accent="up close." />
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-6">
              {gallery.map((img, i) => {
                // full · 2/3 + 1/3 · thirds — the design's showcase rhythm
                const span = i === 0 ? "sm:col-span-6 aspect-[16/8]" : i < 3 ? (i === 1 ? "sm:col-span-4 aspect-[16/10]" : "sm:col-span-2 aspect-[4/5] sm:aspect-auto") : "sm:col-span-2 aspect-square";
                return (
                  <figure key={img.src} data-anim="clip" className={`relative overflow-hidden rounded-[1.1rem] bg-mist ${span}`}>
                    <Image src={img.src} alt={img.alt || `${study.client} work ${i + 1}`} fill sizes="(min-width: 640px) 66vw, 100vw" className="object-cover" />
                  </figure>
                );
              })}
            </div>
          </section>
        )}

        <section className="container-site grid gap-10 py-16 sm:py-24 md:grid-cols-2 md:gap-16" aria-labelledby="results-title">
          <div id="results-title">
            <SectionTitle index={gallery.length ? "05" : "04"} label="Results" lead="Results." accent="What changed." />
            {study.metric && (
              <div data-anim="fade-up" className="mt-8 rounded-card bg-mist p-6">
                <p className="eyebrow text-[0.6rem] text-ink/45">Result</p>
                <p className="mt-3 text-[3.4rem] font-medium leading-none tracking-[-0.05em]">{study.metric.value}</p>
                <p className="mt-2 font-serif text-subtle">{study.metric.label}</p>
              </div>
            )}
          </div>
          <div data-anim="fade-up">
            <RichBlocks blocks={study.conclusion} className="text-ink/85" />
          </div>
        </section>

        {quote && (
          <section className="container-site pb-16 sm:pb-24" aria-label="Client testimonial">
            <figure data-anim="camera" className="rounded-[1.5rem] bg-mist p-6 sm:p-12">
              <p className="eyebrow text-ink/50">In their words</p>
              <blockquote data-anim="words" className="accent mt-5 max-w-4xl text-[clamp(1.5rem,1.1rem+1.4vw,2.3rem)] leading-[1.2] text-ink">“{quote.quote}”</blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#d9a27a] to-[#6b3d22] text-sm font-semibold text-white">
                  {quote.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{quote.name}</span>
                  <span className="block text-xs text-subtle">{quote.role}</span>
                </span>
              </figcaption>
            </figure>
          </section>
        )}

        <section className="container-site" aria-label="Next case study">
          <Link href={`/case-studies/${next.slug}`} className="group grid overflow-hidden rounded-[1.5rem] bg-mist md:grid-cols-2">
            <div className="flex flex-col justify-center p-6 sm:p-12">
              <p className="eyebrow text-ink/50">Next case</p>
              <p className="mt-4 text-[clamp(2rem,1.4rem+2vw,3rem)] font-semibold leading-none tracking-[-0.04em]">{next.client}</p>
              <p className="mt-3 max-w-sm font-serif text-subtle">{next.title}</p>
              <span className="mt-6 grid size-10 place-items-center rounded-lg bg-[radial-gradient(120%_140%_at_80%_0%,#ff8a3d_0%,#c2410c_45%,#1a0b05_100%)] text-white transition-transform duration-500 group-hover:rotate-45">
                <Arrow className="size-4" />
              </span>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden bg-ink md:aspect-auto">
              {next.cover && (
                <Image src={next.cover} alt={`${next.client} — ${next.title}`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[900ms] ease-out-expo group-hover:scale-105" />
              )}
            </div>
          </Link>
        </section>

        <CtaBand
          lead="Got a brand"
          accent="to move?"
          body="Tell us where the brand is today and where you want it to be. We'll come back with a plan for the first few weeks."
        />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: site.url },
              { "@type": "ListItem", position: 2, name: "Work", item: `${site.url}/work` },
              { "@type": "ListItem", position: 3, name: study.client, item: `${site.url}/case-studies/${study.slug}` },
            ],
          }),
        }}
      />
    </>
  );
}
