"use client";

import EchoText from "@/components/motion/EchoText";
import { homeV2 } from "@/content/home-v2";

const SUBTLE = {
  echoes: 5,
  lag: 0.18,
  offset: 10,
  fade: 0.5,
  blur: 1.2,
  tint: "#FE9004",
  mode: "both" as const,
  clickBurst: false,
  cursorRadius: 420,
  duration: 1100,
  fontSize: "1em",
  fontWeight: 400,
  className: "leading-[1.15]! tracking-[-0.005em]!",
};

/**
 * The hero sub-line with React Bits EchoText, dialled right down: a few faint ember echoes trail the words
 * on entrance and lean toward the cursor (on phones they drift on their own). Phones get two lines, since
 * EchoText doesn't wrap.
 */
export function Subline({ compact = false }: { compact?: boolean }) {
  if (!compact) return <EchoText text={homeV2.sub} trail="pointer" {...SUBTLE} />;
  const words = homeV2.sub.split(" ");
  const cut = Math.ceil(words.length * 0.6);
  return (
    <span className="flex flex-col items-start gap-0.5">
      <EchoText text={words.slice(0, cut).join(" ")} trail="auto" {...SUBTLE} />
      <EchoText text={words.slice(cut).join(" ")} trail="auto" {...SUBTLE} />
    </span>
  );
}
