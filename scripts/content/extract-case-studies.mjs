// Pulls every /case-studies/* page from the live site into structured JSON.
// usage: node extract-case-studies.mjs <out.json>
import fs from "node:fs";

const OUT = process.argv[2];
const BASE = "https://minimaltweaks.com";
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh) Chrome/130" };

const decode = (s) =>
  s
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const text = (s) => decode(s.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "")).replace(/[‍​]/g, "").replace(/\s+/g, " ").trim();
const meta = (h, k) => {
  const tag = (h.match(new RegExp(`<meta[^>]*(?:name|property)="${k}"[^>]*>`)) || [])[0] || "";
  return decode((tag.match(/content="([^"]*)"/) || [])[1] || "");
};

async function get(path) {
  const r = await fetch(BASE + path, { headers: UA });
  if (!r.ok) throw new Error(`${path} ${r.status}`);
  return r.text();
}

// Card data (summary + service tag) from the /work index.
const work = await get("/work");
const cards = {};
for (const m of work.matchAll(/href="(?:https:\/\/(?:www\.)?minimaltweaks\.com)?(\/case-studies\/[^"#?]+)"/g)) cards[m[1]] ??= {};
for (const slug of Object.keys(cards)) {
  const i = work.indexOf(`case-studies/${slug.split("/").pop()}"`);
  const win = work.slice(Math.max(0, i - 6000), i + 200);
  const ps = [...win.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1])).filter((t) => t.length > 60);
  const h2 = [...win.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => text(m[1])).filter(Boolean);
  const img = [...win.matchAll(/<img[^>]+src="(https:\/\/[^"]+website-files\.com[^"]+)"/g)].map((m) => m[1]);
  cards[slug] = { summary: ps.at(-1) ?? "", cardTitle: h2.at(-1) ?? "", thumb: img.at(-1) ?? "" };
}

const sitemap = await (await fetch(BASE + "/sitemap.xml", { headers: UA })).text();
const slugs = [...sitemap.matchAll(/<loc>[^<]*?(\/case-studies\/[^<]+)<\/loc>/g)].map((m) => m[1]);

const out = [];
const relatedTags = {};
for (const path of slugs) {
  const h = await get(path);
  const start = h.indexOf("<h1");
  const end = h.indexOf("Have a look at other case studies");
  const main = h.slice(start, end > 0 ? end : undefined).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, "");
  const title = text((main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "");

  const sections = [];
  let cur = { heading: "Intro", blocks: [] };
  for (const m of main.matchAll(/<img\b([^>]*)>|<(h2|h3|h4|p|li|blockquote)\b[^>]*>([\s\S]*?)<\/\2>/g)) {
    const [, imgAttrs, tagName, inner = ""] = m;
    const tag = imgAttrs !== undefined ? "img" : tagName;
    const attrs = imgAttrs ?? "";
    if (tag === "h2") {
      if (cur.blocks.length || cur.heading !== "Intro") sections.push(cur);
      cur = { heading: text(inner), blocks: [] };
    } else if (tag === "img" || tag === "figure") {
      const src = (attrs.match(/src="(https:\/\/[^"]+)"/) || [])[1];
      const alt = decode((attrs.match(/alt="([^"]*)"/) || [])[1] || "");
      if (src && !cur.blocks.some((b) => b.src === src)) cur.blocks.push({ type: "image", src, alt });
    } else {
      const t = text(inner);
      if (t && t.length > 1) cur.blocks.push({ type: tag === "li" ? "li" : tag === "blockquote" ? "quote" : tag.startsWith("h") ? "h" : "p", text: t });
    }
  }
  sections.push(cur);

  const rel = end > 0 ? h.slice(end, end + 20000) : "";
  for (const m of rel.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<h4[^>]*>([\s\S]*?)<\/h4>/g)) relatedTags[text(m[2]).toLowerCase()] = text(m[1]);

  out.push({
    slug: path.split("/").pop(),
    title,
    metaTitle: text((h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ""),
    metaDescription: meta(h, "description"),
    ogImage: meta(h, "og:image"),
    sections,
  });
  process.stdout.write(".");
}
for (const c of out) c.tag = relatedTags[c.title.toLowerCase()] ?? "";
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`\n${out.length} case studies → ${OUT}`);
