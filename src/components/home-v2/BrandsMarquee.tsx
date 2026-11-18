import { homeV2 } from "@/content/home-v2";

/** Logo height (% of the card) for a logo with the reference aspect ratio (3:1, a typical wordmark). */
const BASE_HEIGHT = 30;
const REF_ASPECT = 3;

/**
 * Equal visual area: a logo's perceived size follows its area, so height scales with 1/sqrt(aspect).
 * Wide wordmarks get shorter, compact marks taller, and they all read as the same size.
 */
const logoHeight = (w: number, h: number, scale = 1) => BASE_HEIGHT * Math.sqrt(REF_ASPECT / (w / h)) * scale;

type Brand = (typeof homeV2.brands)[number];

function Card({ brand, compact }: { brand: Brand; compact: boolean }) {
  const { name, logo, w, h, scale = 1 } = brand;
  return (
    <li
      className={`relative grid shrink-0 place-items-center rounded-2xl border border-[#e8e6e3] bg-white ${
        compact ? "h-28 w-52" : "h-[clamp(7rem,15vh,9.5rem)] w-[clamp(13rem,18vw,17.5rem)]"
      }`}
    >
      {logo ? (
        // Plain <img>: the files are already sized and compressed WebP (scripts in the PR); all copies share one request.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt=""
          width={w}
          height={h}
          decoding="async"
          draggable={false}
          // Centred in the card on both axes, always in full colour.
          className="w-auto max-w-[64%] object-contain"
          style={{ height: `${logoHeight(w ?? 3, h ?? 1, scale)}%` }}
        />
      ) : (
        <span
          className={`px-4 text-center font-semibold tracking-[-0.03em] ${compact ? "text-[1.3rem]" : "text-[clamp(1.25rem,0.9rem+0.9vw,1.75rem)]"} text-ink`}
        >
          {name}
        </span>
      )}
    </li>
  );
}

/**
 * "Brands we've tweaked": a plain, endless marquee. Pure CSS (one transform animation on the GPU), pauses on hover,
 * soft fade at both edges. The list is doubled so it's always wider than the screen, then doubled again for the loop.
 */
export function BrandsMarquee({ compact = false }: { compact?: boolean }) {
  const fade = compact ? "from-[#fdf1e6]" : "from-white";
  const set = [...homeV2.brands, ...homeV2.brands];
  return (
    <div className="group relative overflow-hidden py-2">
      {/* Edge fades as plain overlays: a CSS mask over a moving track is re-composited every frame. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-[6%] bg-gradient-to-r ${fade} to-transparent`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-[6%] bg-gradient-to-l ${fade} to-transparent`}
      />
      <ul
        aria-hidden
        className="flex w-max gap-4 motion-safe:animate-[brands-loop_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ animationDuration: compact ? "35s" : "50s" }}
      >
        {[...set, ...set].map((b, i) => (
          <Card key={i} brand={b} compact={compact} />
        ))}
      </ul>
      {/* Screen readers get the list once. */}
      <p className="sr-only">{homeV2.brands.map((b) => b.name).join(", ")}</p>
    </div>
  );
}
