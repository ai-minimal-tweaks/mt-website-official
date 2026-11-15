import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";
import { NotFoundHero } from "@/components/notfound/NotFoundHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

// Rendered for every URL without a page (including unknown /work/case-study/* slugs), with a 404 status.
export default function NotFound() {
  return (
    <>
      <main>
        <NotFoundHero />

        <section className="container-site py-16 sm:py-24" aria-labelledby="nf-form-title">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <p data-anim="fade-up" className="eyebrow text-ink/50">
                Lost? <span className="text-muted">Let&apos;s talk</span>
              </p>
              <h2 id="nf-form-title" data-anim="lines" className="mt-5 text-heading font-medium tracking-[-0.04em]">
                <span className="line-mask">
                  <span className="text-muted">Looking for something?</span>
                </span>
                <span className="line-mask">
                  <span className="accent">Let&apos;s build it instead.</span>
                </span>
              </h2>
              <p data-anim="fade-up" className="mt-6 max-w-md font-serif text-lg leading-snug text-subtle">
                If you were after a page that used to live here, tell us what you needed. If you&apos;ve got a brand to move,
                tell us about that too.
              </p>
              <p data-anim="fade-up" className="mt-8 text-sm text-subtle">
                Or email{" "}
                <a href={`mailto:${site.email}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                  {site.email}
                </a>
              </p>
            </div>
            <div data-anim="fade-up" className="rounded-[1.5rem] border border-line bg-white p-6 shadow-[0_40px_80px_-50px_rgba(0,0,0,.45)] sm:p-10">
              <h3 className="text-[1.75rem] font-semibold tracking-[-0.04em]">Start a project</h3>
              <p className="mt-2 text-sm text-subtle">Fields marked * are required.</p>
              <div className="mt-7">
                <ContactForm source="404" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer cta={false} />
    </>
  );
}
