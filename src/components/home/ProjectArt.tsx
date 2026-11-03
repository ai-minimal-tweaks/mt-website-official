// Art-directed stand-ins for case-study thumbnails, composed in CSS so they stay crisp at any size.
// Replace with real imagery by giving a project an `image` once assets are supplied.

type Art = "crex" | "artworkflow" | "crunchy" | "finsense";

function Monitor({ screen, pedestal = "from-[#2a2a2a] to-black" }: { screen: React.ReactNode; pedestal?: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[88%] flex-col items-center justify-end">
      <div className="relative z-10 aspect-[16/10] w-[58%] rounded-[6px] border-[5px] border-[#1d1d1d] bg-white shadow-2xl">{screen}</div>
      <div className="z-10 h-[9%] w-[8%] bg-gradient-to-b from-[#3a3a3a] to-[#181818]" />
      <div className={`h-[22%] w-[68%] rounded-t-[50%/30%] bg-gradient-to-b ${pedestal}`} />
    </div>
  );
}

export function ProjectArt({ art }: { art: Art }) {
  switch (art) {
    case "crex":
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#0d0d0d]">
          <div className="absolute -inset-[25%] grid rotate-[-14deg] grid-cols-6 gap-2.5">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-lg border border-white/10 bg-gradient-to-br from-[#1f1f1f] to-[#121212] p-1.5">
                <div
                  className={`size-full rounded-lg ${
                    ["bg-[radial-gradient(circle_at_50%_60%,#e9d9b5_0%,#7a5a2a_40%,transparent_62%)]", "bg-[linear-gradient(160deg,#2a3cff33,transparent)]", "bg-[radial-gradient(circle_at_40%_40%,#f4f4f4_0%,#cfcfcf_25%,transparent_45%)]", "bg-[radial-gradient(circle_at_60%_70%,#ff6a1a55,transparent_60%)]"][i % 4]
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      );
    case "artworkflow":
      return (
        <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,#0e0a3d_0%,#2a1fb8_70%,#6c5cff_100%)]">
          <Monitor
            pedestal="from-[#3d2fd6] to-[#0a0730]"
            screen={
              <div className="relative size-full overflow-hidden p-[6%]">
                <div className="h-[12%] w-[40%] rounded bg-ink/80" />
                <div className="mt-[6%] h-[10%] w-[55%] rounded bg-[#ffb02e]" />
                <div className="mt-[4%] h-[10%] w-[45%] rounded bg-[#5b4cff]" />
                <div className="absolute right-[6%] top-[14%] size-[42%] rounded-full bg-[conic-gradient(#5b4cff_0_35%,#ffb02e_0_55%,#22c55e_0_70%,#ef4444_0_100%)]" />
              </div>
            }
          />
        </div>
      );
    case "crunchy":
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#ffd60a]">
          <Monitor
            screen={
              <div className="flex size-full flex-col items-center justify-center bg-[#ffe347] text-center">
                <span className="font-sans text-[clamp(0.6rem,1.6vw,1.05rem)] font-black uppercase leading-[0.9] tracking-tight text-[#1f7a1f]">
                  Crunchier
                  <br />
                  than a munch
                </span>
                <span className="mt-1.5 h-[8%] w-[22%] rounded-full bg-[#1f7a1f]" />
              </div>
            }
          />
        </div>
      );
    case "finsense":
      return (
        <div className="absolute inset-0 overflow-hidden bg-[#0c0c0c]">
          <svg viewBox="0 0 400 260" className="absolute inset-0 size-full" aria-hidden>
            <g stroke="#ffd60a" strokeOpacity=".45" strokeDasharray="2 4" fill="none">
              <path d="M120 170H330M200 60v170M260 40v60" />
            </g>
            <circle cx="200" cy="160" r="62" fill="#ffd60a" />
            <circle cx="260" cy="70" r="22" fill="#ffd60a" />
            <g fill="#ffd60a" fontSize="10" fontFamily="sans-serif" opacity=".7">
              <text x="300" y="72">X</text>
              <text x="282" y="165">4X</text>
              <text x="118" y="182">30°</text>
            </g>
          </svg>
        </div>
      );
  }
}
