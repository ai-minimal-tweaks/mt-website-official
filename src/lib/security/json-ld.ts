/**
 * Serialises structured data for a <script type="application/ld+json"> tag. JSON.stringify alone does not escape
 * "<", so CMS text containing "</script>" could break out of the tag and inject markup (stored XSS).
 */
// Line/paragraph separators (U+2028/9) are valid in JSON but end lines in older JS parsers.
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

export function jsonLd(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .split(LS).join("\\u2028")
    .split(PS).join("\\u2029");
}
