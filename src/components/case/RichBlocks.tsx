import type { Block } from "@/content/case-studies";

type TextBlock = Extract<Block, { type: "p" | "li" | "h" | "quote" }>;

/** Renders case-study copy (media blocks are placed by the page, not here): paragraphs, sub-heads, quotes and runs of list items as one list. */
export function RichBlocks({ blocks, tone = "dark", className = "" }: { blocks: Block[]; tone?: "dark" | "light"; className?: string }) {
  const text = blocks.filter((b): b is TextBlock => b.type !== "image" && b.type !== "video");
  const groups: (TextBlock | TextBlock[])[] = [];
  for (const b of text) {
    const last = groups.at(-1);
    if (b.type === "li" && Array.isArray(last)) last.push(b);
    else groups.push(b.type === "li" ? [b] : b);
  }
  const body = tone === "dark" ? "text-subtle" : "text-white/80";
  return (
    <div className={`space-y-4 font-serif text-[1.05rem] leading-relaxed ${body} ${className}`}>
      {groups.map((g, i) =>
        Array.isArray(g) ? (
          <ul key={i} className="space-y-2.5">
            {g.map((li, j) => (
              <li key={j} className="flex gap-3">
                <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-flame" />
                <span>{li.text}</span>
              </li>
            ))}
          </ul>
        ) : g.type === "h" ? (
          <h3 key={i} className={`pt-2 font-sans text-base font-semibold ${tone === "dark" ? "text-ink" : "text-white"}`}>
            {g.text}
          </h3>
        ) : g.type === "quote" ? (
          <blockquote key={i} className="border-l-2 border-flame pl-4 italic">
            {g.text}
          </blockquote>
        ) : (
          <p key={i}>{g.text}</p>
        ),
      )}
    </div>
  );
}
