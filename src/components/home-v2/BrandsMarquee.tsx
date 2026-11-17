import { homeV2 } from "@/content/home-v2";

function Card({ name, live, compact }: { name: string; live: boolean; compact: boolean }) {
  return (
    <li
      className={`relative grid shrink-0 place-items-center rounded-2xl ${compact ? "h-28 w-52" : "h-[clamp(7rem,15vh,9.5rem)] w-[clamp(13rem,18vw,17.5rem)]"} ${
        live ? "border-2 border-[#3fb262] bg-white" : "bg-[#efefee]"
      }`}
    >
      {live && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-[#e8f7ec] px-2 py-1 text-[0.72rem] font-medium text-[#2f9e52]">
          <span className="size-1.5 rounded-full bg-[#2f9e52]" />
          Live
        </span>
      )}
      <span className={`px-4 text-center font-medium tracking-[-0.02em] ${compact ? "text-[1.3rem]" : "text-[clamp(1.25rem,0.9rem+0.9vw,1.75rem)]"} ${live ? "text-ink" : "text-ink/45"}`}>
        {name}
      </span>
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
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-[6%] bg-gradient-to-r ${fade} to-transparent`} />
      <div aria-hidden className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-[6%] bg-gradient-to-l ${fade} to-transparent`} />
      <ul
        aria-hidden
        className="flex w-max gap-4 motion-safe:animate-[brands-loop_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ animationDuration: compact ? "26s" : "38s" }}
      >
        {[...set, ...set].map((b, i) => (
          <Card key={i} name={b.name} live={b.live} compact={compact} />
        ))}
      </ul>
      {/* Screen readers get the list once. */}
      <p className="sr-only">{homeV2.brands.map((b) => b.name).join(", ")}</p>
    </div>
  );
}
