import { stats } from "@/content/home";
import { DotGlobe } from "@/components/three/DotGlobe";
import { Pill, SectionHeading } from "@/components/ui";

const brandBadges = [
  { bg: "bg-[#e4245c]", label: "C" },
  { bg: "bg-ink", label: "A" },
  { bg: "bg-flame", label: "go" },
];
const community = ["from-[#d9a27a] to-[#6b3d22]", "from-[#c7b6a6] to-[#4a3f3a]", "from-[#e7a27c] to-[#8a3b1f]"];

export function Impact() {
  const [brands, industries, communityStat] = stats;
  return (
    <section className="py-16 sm:py-24" aria-labelledby="impact-title">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading lead="More Than Numbers." accent="It’s the Impact We Create." />
          <p data-anim="fade-up" className="max-w-sm font-serif text-[1.05rem] leading-snug text-subtle md:text-right">
            Every number represents a collaboration, a challenge solved, and a digital experience built to make a difference.
          </p>
        </div>
        <h2 id="impact-title" className="sr-only">
          Our impact
        </h2>

        <div data-anim="stagger" className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-2">
          <StatCard stat={brands}>
            <div aria-hidden className="dot-grid absolute -right-6 top-0 h-full w-1/2 text-ink/15 [mask-image:radial-gradient(60%_70%_at_70%_40%,#000,transparent)]" />
            <div className="relative mt-6 flex items-center">
              {brandBadges.map((b, i) => (
                <span
                  key={b.label}
                  className={`${b.bg} grid size-9 place-items-center rounded-full border-2 border-mist text-[0.62rem] font-bold text-white`}
                  style={{ marginLeft: i ? -8 : 0 }}
                >
                  {b.label}
                </span>
              ))}
              <span className="-ml-2 grid size-9 place-items-center rounded-full border-2 border-mist bg-ink/10 text-xs font-semibold text-ink/60">32+</span>
            </div>
          </StatCard>

          <StatCard stat={industries}>
            <div aria-hidden className="absolute inset-y-0 left-0 z-[5] w-3/5 bg-gradient-to-r from-mist via-mist/80 to-transparent lg:hidden" />
            <DotGlobe className="absolute -bottom-20 -right-20 size-[17rem] cursor-grab active:cursor-grabbing sm:size-[18rem] lg:-right-8 lg:bottom-auto lg:top-1/2 lg:size-[21rem] lg:-translate-y-1/2" />
          </StatCard>

          <StatCard stat={communityStat}>
            <svg data-anim="draw" aria-hidden viewBox="0 0 400 220" className="absolute bottom-0 right-0 h-full w-2/3 text-ink/20" fill="none">
              <path d="M10 210C120 205 170 170 220 120S330 20 395 10" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="222" cy="118" r="3.5" className="fill-ink/40" />
            </svg>
            <div className="relative mt-6 flex items-center">
              {community.map((g, i) => (
                <span key={g} className={`size-9 rounded-full border-2 border-mist bg-gradient-to-br ${g}`} style={{ marginLeft: i ? -8 : 0 }} />
              ))}
              <span className="-ml-2 grid size-9 place-items-center rounded-full border-2 border-mist bg-ink/10 text-xs font-semibold text-ink/60">+</span>
            </div>
          </StatCard>

          <article data-anim-item className="relative min-h-[20rem] overflow-hidden rounded-card bg-mist p-6 sm:min-h-[22rem] sm:p-8">
            <p className="eyebrow text-ink/50">
              Creative <span className="text-muted/60">digital agency</span>
            </p>
            <h3 className="relative z-10 mt-5 max-w-[15rem] text-[1.9rem] font-medium leading-[1.05] tracking-[-0.04em] sm:text-[2.2rem]">
              Creativity + Tech, with a few <span className="accent">minimal tweaks.</span>
            </h3>
            <p className="relative z-10 mt-4 max-w-[15rem] font-serif text-sm leading-snug text-subtle">
              We are a creative digital agency focused on digital tweaks to grow brands.
            </p>
            <div className="relative z-10 mt-6">
              <Pill href="/services" size="sm">
                Explore services
              </Pill>
            </div>
            <Orbit />
          </article>
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, children }: { stat: (typeof stats)[number]; children?: React.ReactNode }) {
  return (
    <article data-anim-item className="relative min-h-[20rem] overflow-hidden rounded-card bg-mist p-6 sm:min-h-[22rem] sm:p-8">
      <p className="eyebrow relative z-10 text-ink/50">
        {stat.eyebrow.split(" ")[0]} <span className="text-muted/60">{stat.eyebrow.split(" ").slice(1).join(" ")}</span>
      </p>
      <p className="relative z-10 mt-6 text-[4.2rem] font-medium leading-none tracking-[-0.06em] sm:text-[5rem]">
        <span data-anim="count" data-value={stat.value}>
          {stat.value}
        </span>
        {stat.suffix}
      </p>
      <h3 className="accent relative z-10 mt-2 max-w-[9rem] text-2xl leading-[1.05] text-ink">{stat.label}</h3>
      <p className="relative z-10 mt-4 max-w-[14rem] font-serif text-sm leading-snug text-subtle">{stat.body}</p>
      {children}
    </article>
  );
}

/** CSS-3D orbit: brand nodes circling the MT core on tilted rings. */
function Orbit() {
  const rings = [
    { scale: 1, duration: "14s", reverse: false, nodes: [{ cls: "bg-[#e4245c]", label: "C", angle: 20 }, { cls: "bg-flame", label: "go", angle: 200 }] },
    { scale: 0.66, duration: "10s", reverse: true, nodes: [{ cls: "bg-ink", label: "A", angle: 110 }] },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-28 size-[18rem] [perspective:900px] lg:-bottom-16 lg:-right-14 lg:size-[21rem]">
      <div className="absolute inset-0 grid place-items-center">
        <span className="z-10 flex size-16 items-center justify-center whitespace-nowrap rounded-full bg-navy text-base font-bold text-white shadow-[0_20px_40px_-12px_rgba(27,31,59,.7)]">
          M<span className="text-ember">T</span>
        </span>
      </div>
      {rings.map((ring, i) => (
        <div key={i} className="absolute inset-0" style={{ scale: String(ring.scale) }}>
          <div
            className="absolute inset-0 rounded-full border border-ink/20 [transform-style:preserve-3d] motion-safe:animate-[orbit_linear_infinite]"
            style={{ transform: "rotateX(68deg)", animationDuration: ring.duration, animationDirection: ring.reverse ? "reverse" : "normal" }}
          >
            {ring.nodes.map((n) => (
              <span
                key={n.label}
                className="absolute -ml-5 -mt-5 [transform-style:preserve-3d]"
                style={{ left: `${50 + 50 * Math.cos((n.angle * Math.PI) / 180)}%`, top: `${50 + 50 * Math.sin((n.angle * Math.PI) / 180)}%` }}
              >
                <span
                  className={`grid size-10 place-items-center rounded-full text-xs font-bold text-white shadow-lg ${n.cls} motion-safe:animate-[counter-orbit_linear_infinite]`}
                  style={{ transform: "rotateZ(0deg) rotateX(-68deg)", animationDuration: ring.duration, animationDirection: ring.reverse ? "reverse" : "normal" }}
                >
                  {n.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      ))}
      <span className="absolute left-[30%] top-[22%] size-2 rounded-full bg-[#e4245c]" />
      <span className="absolute right-[24%] top-[36%] size-1.5 rounded-full bg-ink" />
    </div>
  );
}
