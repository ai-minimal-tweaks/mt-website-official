import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { CtaBand, PageHero, SelectWord } from "@/components/shared";
import { SectionHeading } from "@/components/ui";
import { WorkGrid } from "@/components/work/WorkGrid";
import { getCaseStudies } from "@/lib/cms/store";

export const metadata: Metadata = {
  title: "Work Case Studies",
  description:
    "Brands, content, social and campaigns for teams that want to grow. A few of the brands we've tweaked, and what changed for them.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const caseStudies = getCaseStudies();
  return (
    <>
      <main>
        <PageHero className="min-h-[34rem] sm:min-h-[38rem]">
          <h1 data-anim="lines" className="text-display font-medium tracking-[-0.045em]">
            <span className="line-mask">
              <span>Work that</span>
            </span>
            <span className="line-mask pt-[0.06em]">
              <span>
                <em className="font-serif font-light italic tracking-[-0.03em]">moved</em> <SelectWord>brands.</SelectWord>
              </span>
            </span>
          </h1>
          <p data-anim="fade-up" className="mx-auto mt-7 max-w-md font-serif text-[1.02rem] leading-snug text-white/85 sm:text-lg">
            Brands, content, social and campaigns for teams that want to grow. A few of the brands we&apos;ve tweaked, and what
            changed for them.
          </p>
        </PageHero>

        <section className="py-16 sm:py-24" aria-label="Case studies">
          <div className="container-site">
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading lead="Selected work." accent="Outcomes first." />
              <p data-anim="fade-up" className="max-w-xs font-serif text-[1.05rem] leading-snug text-subtle md:text-right">
                {caseStudies.length} projects across branding, content, social, campaigns, web and SEO.
              </p>
            </div>
            {/* useSearchParams needs a Suspense boundary for static rendering */}
            <Suspense>
              <WorkGrid caseStudies={caseStudies} />
            </Suspense>
          </div>
        </section>

        <CtaBand
          lead="Got a brand"
          accent="to move?"
          body="Tell us where the brand is today and where you want it to be. We'll come back with a plan for the first few weeks."
        />
      </main>
      <Footer />
    </>
  );
}
