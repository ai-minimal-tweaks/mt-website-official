import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";
import { GradientField } from "@/components/three/GradientField";
import { SectionHeading, SocialIcon } from "@/components/ui";
import { nextSteps } from "@/content/contact";
import { site, socials } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Start a Project",
  description:
    "Tell us about the brand and what you want it to do next. Get in touch with Minimal Tweaks to start a project or book a discovery call.",
  alternates: { canonical: "/contact" },
};

const discoveryCall = `mailto:${site.email}?subject=${encodeURIComponent("Book a discovery call")}`;

export default function ContactPage() {
  return (
    <>
      <main>
        <section className="relative p-2 sm:p-3">
          <div data-anim="shell" className="relative isolate overflow-hidden rounded-[1.5rem] bg-ink text-white sm:rounded-shell">
            <GradientField bias={[0.1, -0.05]} />
            {/* The stacked phone layout stretches the glow behind the copy; darken it to keep text contrast */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-ink/50 lg:hidden" />
            <div className="container-site relative grid gap-12 pb-12 pt-32 sm:pt-40 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:pb-16">
              <div>
                <h1 data-anim="lines" className="text-[clamp(2.4rem,1.4rem+3.6vw,4.2rem)] font-medium leading-[1.03] tracking-[-0.045em]">
                  <span className="line-mask">
                    <span className="font-serif font-light italic tracking-[-0.03em]">Got an idea?</span>
                  </span>
                  <span className="line-mask">
                    <span>Let&apos;s build it together.</span>
                  </span>
                </h1>
                <p data-anim="fade-up" className="mt-6 max-w-md font-serif text-lg leading-snug text-white/85">
                  Tell us about the brand and what you want it to do next. We&apos;ll come back with simple next steps.
                </p>

                <dl data-anim="stagger" className="mt-10 space-y-7">
                  <div data-anim-item>
                    <dt className="eyebrow text-[0.62rem] text-white/50">Email</dt>
                    <dd className="mt-2">
                      <a href={`mailto:${site.email}`} className="font-medium transition hover:text-ember">
                        {site.email}
                      </a>
                    </dd>
                  </div>
                  <div data-anim-item>
                    <dt className="eyebrow text-[0.62rem] text-white/50">Phone</dt>
                    <dd className="mt-2 space-y-1">
                      {site.phones.map((p) => (
                        <a key={p} href={`tel:${p.replace(/-/g, "")}`} className="block transition hover:text-ember">
                          {p}
                        </a>
                      ))}
                    </dd>
                  </div>
                  <div data-anim-item>
                    <dt className="eyebrow text-[0.62rem] text-white/50">Location</dt>
                    <dd className="mt-2 max-w-xs leading-snug text-white/90">{site.address}</dd>
                  </div>
                  <div data-anim-item>
                    <dt className="eyebrow text-[0.62rem] text-white/50">Follow us</dt>
                    <dd className="mt-3 flex gap-2">
                      {socials.map((s) => (
                        <a
                          key={s.key}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white hover:text-ink"
                        >
                          <SocialIcon name={s.key} />
                        </a>
                      ))}
                    </dd>
                  </div>
                </dl>

                <a
                  id="discovery-call"
                  data-anim="fade-up"
                  href={discoveryCall}
                  className="mt-10 inline-flex h-12 scroll-mt-32 items-center rounded-lg border border-white/80 px-6 text-xs font-semibold uppercase tracking-[0.08em] transition hover:bg-white hover:text-ink"
                >
                  Book a discovery call
                </a>
              </div>

              <div data-anim="fade-up" className="relative rounded-[1.5rem] bg-white p-6 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)] sm:p-10">
                <h2 className="text-[2rem] font-semibold tracking-[-0.04em]">Start a project</h2>
                <p className="mt-2 text-sm text-subtle">Fields marked * are required.</p>
                <div className="mt-7">
                  <ContactForm source="contact-page" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-site py-16 sm:py-24" aria-labelledby="next-title">
          <div id="next-title">
            <SectionHeading lead="What happens" accent="next." />
          </div>
          <ol data-anim="stagger" className="mt-10 grid gap-4 md:grid-cols-3">
            {nextSteps.map((s, i) => (
              <li key={s.title} data-anim-item className="rounded-[1.25rem] bg-mist p-6 sm:p-7">
                <span className="grid size-9 place-items-center rounded-md bg-ink text-xs font-bold text-white">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-[1.9rem] font-semibold tracking-[-0.04em]">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-subtle">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer cta={false} />
    </>
  );
}
