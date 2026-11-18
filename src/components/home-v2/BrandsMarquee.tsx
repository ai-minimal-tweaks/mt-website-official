import { homeV2 } from "@/content/home-v2";

// Tiles are 232x120 (the design's size). Shown at exactly that size on desktop so they stay pixel-sharp.
const TILE_W = 232;
const TILE_H = 120;

function Tile({ name, tile, compact }: { name: string; tile: string; compact: boolean }) {
  return (
    <li className="shrink-0">
      {/* Plain <img>: already-compressed WebP at its final size; every copy in the loop shares one request. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tile}
        alt=""
        title={name}
        width={TILE_W}
        height={TILE_H}
        decoding="async"
        draggable={false}
        className={compact ? "h-[104px] w-auto" : "h-[120px] w-[232px]"}
      />
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
        style={{ animationDuration: compact ? "40s" : "55s" }}
      >
        {[...set, ...set].map((b, i) => (
          <Tile key={i} name={b.name} tile={b.tile} compact={compact} />
        ))}
      </ul>
      {/* Screen readers get the list once. */}
      <p className="sr-only">{homeV2.brands.map((b) => b.name).join(", ")}</p>
    </div>
  );
}
