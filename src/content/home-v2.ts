// Copy for the temporary v2 homepage ("MT Homepage v2-temporary" design). See HOMEPAGE in src/lib/pages.ts.

export const homeV2 = {
  tagline: "Creative agency in Gurugram",
  headline: { lead: "creative work needs", struck: "a lot of", accent: "minimal tweaks" },
  sub: "Ads, campaigns and content for brands that can’t afford average.",
  ctas: { deck: "Request our deck", project: "Start a project" },
  brandsLabel: "Brands we’ve tweaked",
  /**
   * Carousel order. `live`: an account we're running right now (green "Live" tag; others are shown greyed out).
   * `logo`: /public/images/brands/*.webp (trimmed, fitted to a 400x140 box, WebP) with its pixel size.
   * Logos are sized to the same visual area automatically; `scale` only corrects for ink density
   * (e.g. XYXX is a solid black block, so it reads larger than its outline suggests).
   */
  brands: [
    { name: "MakeMyTrip", live: true, logo: "/images/brands/makemytrip.webp", w: 400, h: 127 },
    { name: "Kerala Ayurveda", live: false, logo: "/images/brands/kerala-ayurveda.webp", w: 400, h: 117 },
    { name: "IndiaMART", live: true, logo: "/images/brands/indiamart.webp", w: 218, h: 140 },
    { name: "upGrad", live: false, logo: "/images/brands/upgrad.webp", w: 400, h: 103, scale: 0.95 },
    { name: "XYXX", live: true, logo: "/images/brands/xyxx.webp", w: 389, h: 140, scale: 0.86 },
    { name: "OZi", live: false, logo: "/images/brands/ozi.webp", w: 294, h: 140, scale: 0.9 },
  ] as { name: string; live: boolean; logo?: string; w?: number; h?: number; scale?: number }[],
};

export const forms = {
  project: {
    title: "Start a project",
    submit: "Start a project",
    done: {
      title: "Awesome, you’re in!",
      body: "Your brief just landed with the crew. We’ll slide into your inbox in no time. Cheers ✌️",
      tags: ["brief received ✓", "no cap, we’re on it", "cheers!"],
    },
  },
  deck: {
    title: "Request Deck",
    submit: "Request Deck",
    done: {
      title: "Deck’s on its way!",
      body: "Awesome — keep an eye on your inbox, it’ll be there in no time. Cheers ✌️",
      tags: ["request received ✓", "fresh from the oven", "cheers!"],
    },
  },
} as const;
