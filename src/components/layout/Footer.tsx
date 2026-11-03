import Link from "next/link";
import { footerColumns, site, socials } from "@/lib/site";
import { Logo, Pill, SocialIcon } from "@/components/ui";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-mist-2 pt-20 text-ink sm:pt-28">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-0 size-[34rem] rounded-full bg-peach blur-[120px]" />

      <div className="container-site relative">
        <div className="grid gap-10 border-b border-ink/10 pb-14 md:grid-cols-[1.1fr_1fr] md:items-end md:pb-20">
          <div>
            <p data-anim="fade-up" className="eyebrow text-ink/70">
              Let&apos;s work <span className="text-muted">together</span>
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
            <p className="font-serif text-lg leading-snug text-ink/80">
              Whether it&apos;s a new brand, a website or a complete digital experience, we&apos;re here to turn your
              ideas into impactful design and digital solutions.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Pill href="/talk">Start a project</Pill>
              <Pill href="/talk" variant="outline">
                Book a discovery call
              </Pill>
            </div>
          </div>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr]">
          <div data-anim="stagger" className="grid gap-10 sm:col-span-2 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-[1fr_1fr_2.2fr]">
            <div data-anim-item>
              <h3 className="text-xs font-semibold uppercase tracking-wider">Phone</h3>
              <ul className="mt-3 space-y-1 text-sm text-ink/70">
                {site.phones.map((p) => (
                  <li key={p}>
                    <a href={`tel:${p.replace(/-/g, "")}`} className="transition-colors hover:text-flame">
                      {p}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div data-anim-item>
              <h3 className="text-xs font-semibold uppercase tracking-wider">Location</h3>
              <p className="mt-3 max-w-60 text-sm leading-relaxed text-ink/70">{site.address}</p>
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title} data-anim="fade-up">
              <h3 className="text-xs font-semibold uppercase tracking-wider">{col.title}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-ink/70">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-flame">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="transition-colors hover:text-flame">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div data-anim="fade-up">
            <h3 className="eyebrow text-ink">
              Get <span className="text-muted">in touch</span>
            </h3>
            <p className="mt-3 max-w-56 text-[0.95rem] leading-snug text-ink/80">Feel free to get in touch with us via email</p>
            <a
              href={`mailto:${site.email}?subject=Tweak%20My%20Brand`}
              className="mt-5 inline-flex h-12 items-center gap-2.5 rounded-full border border-ink/15 bg-white px-5 text-sm font-medium shadow-[0_8px_24px_-16px_rgba(0,0,0,.4)] transition hover:border-flame hover:text-flame"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 3.2V17h16V8.2l-8 5-8-5ZM19 7H5l7 4.4L19 7Z" />
              </svg>
              {site.email}
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 border-t border-ink/10 py-7 sm:flex-row sm:justify-between">
          <Logo withWordmark />
          <p className="text-xs text-ink/50">© {new Date().getFullYear()} Minimal Tweaks. All rights reserved.</p>
          <ul className="flex items-center gap-4 text-ink/60">
            {socials.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-9 place-items-center rounded-full transition hover:bg-ink hover:text-white"
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
