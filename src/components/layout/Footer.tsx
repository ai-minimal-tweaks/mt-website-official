import Link from "next/link";
import { footerColumns, site, socials } from "@/lib/site";
import { Logo, Pill, SocialIcon } from "@/components/ui";
import { GradientField } from "@/components/three/GradientField";

/** Dark footer with the liquid-light field. `cta={false}` drops the "Got an idea?" block (e.g. on /contact). */
export function Footer({ cta = true }: { cta?: boolean }) {
  return (
    <footer className="relative isolate overflow-hidden bg-ink pt-20 text-white sm:pt-24">
      <GradientField bias={[-0.1, -0.15]} intensity={0.8} />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/30 to-ink/60" />

      <div className="container-site relative">
        {cta && (
          <div className="grid gap-10 border-b border-white/10 pb-14 md:grid-cols-[1.1fr_1fr] md:items-end md:pb-20">
            <div>
              <p data-anim="fade-up" className="eyebrow text-white/80">
                Let&apos;s work <span className="text-white/40">together</span>
              </p>
              <h2 data-anim="lines" className="mt-5 text-heading font-medium tracking-[-0.04em]">
                <span className="line-mask">
                  <span className="accent">Got an idea?</span>
                </span>
                <span className="line-mask">
                  <span>Let&apos;s build it together.</span>
                </span>
              </h2>
            </div>
            <div data-anim="fade-up" className="max-w-md md:justify-self-end">
              <p className="font-serif text-lg leading-snug text-white/85">
                Whether it&apos;s a new brand, a website or a complete digital experience, we&apos;re here to turn your
                ideas into impactful design and digital solutions.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Pill href="/contact" variant="light" size="sm">
                  Start a project
                </Pill>
                <Pill href="/contact#discovery-call" variant="glass" size="sm">
                  Book a discovery call
                </Pill>
              </div>
            </div>
          </div>
        )}

        <div data-anim="stagger" className="grid gap-10 py-14 sm:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_3fr]">
          <div data-anim-item>
            <h3 className="text-xs font-semibold uppercase tracking-wider">Phone</h3>
            <ul className="mt-3 space-y-1 text-sm text-white/70">
              {site.phones.map((p) => (
                <li key={p}>
                  <a href={`tel:${p.replace(/-/g, "")}`} className="transition-colors hover:text-ember">
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div data-anim-item>
            <h3 className="text-xs font-semibold uppercase tracking-wider">Location</h3>
            <p className="mt-3 max-w-64 text-sm leading-relaxed text-white/70">{site.address}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 pb-14 lg:grid-cols-[1fr_1fr_1fr_1.3fr]">
          {footerColumns.map((col) => (
            <div key={col.title} data-anim="fade-up">
              <h3 className="text-xs font-semibold uppercase tracking-wider">{col.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-white/70">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ember">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="transition-colors hover:text-ember">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div data-anim="fade-up" className="col-span-2 lg:col-span-1">
            <h3 className="eyebrow text-white">
              Get <span className="text-white/40">in touch</span>
            </h3>
            <p className="mt-3 max-w-56 text-[0.95rem] leading-snug text-white/85">Feel free to get in touch with us via email</p>
            <a
              href={`mailto:${site.email}?subject=Tweak%20My%20Brand`}
              className="mt-5 inline-flex h-12 items-center gap-2.5 rounded-full border border-white/25 bg-white/5 px-5 text-sm font-medium backdrop-blur transition hover:border-ember hover:text-ember"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 3.2V17h16V8.2l-8 5-8-5ZM19 7H5l7 4.4L19 7Z" />
              </svg>
              {site.email}
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 border-t border-white/10 py-7 sm:flex-row sm:justify-between">
          <Logo tone="light" />
          <p className="text-xs text-white/50">© {new Date().getFullYear()} Minimal Tweaks. All rights reserved.</p>
          <ul className="flex items-center gap-2 text-white/70">
            {socials.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-9 place-items-center rounded-full transition hover:bg-white hover:text-ink"
                >
                  <SocialIcon name={s.key} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
