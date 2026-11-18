// Copy for the temporary v2 homepage ("MT Homepage v2-temporary" design). See HOMEPAGE in src/lib/pages.ts.

export const homeV2 = {
  tagline: "Tweaking since 2022",
  /** Footer link to the hiring form (ClickUp). */
  joinUs: { label: "Become a Tweaker", href: "https://forms.clickup.com/9002063377/f/8c915gh-7176/LMQBVKW8D9ZPOHBYOR" },
  headline: { lead: "creative work needs", struck: "a lot of", accent: "minimal tweaks" },
  sub: "Ads, campaigns and content for brands that can’t afford average.",
  ctas: { deck: "Request our deck", project: "Start a project" },
  brandsLabel: "Brands we’ve tweaked",
  /**
   * Carousel order. Each brand is a ready-made tile (logo on a white card with the orange outline), exported from the
   * design at 232x120 and saved as WebP in /public/images/brands. To add a brand, export its tile the same way.
   */
  brands: [
    { name: "upGrad", tile: "/images/brands/upgrad.webp" },
    { name: "CREX", tile: "/images/brands/crex.webp" },
    { name: "Haptik", tile: "/images/brands/haptik.webp" },
    { name: "goibibo", tile: "/images/brands/goibibo.webp" },
    { name: "IndiaMART", tile: "/images/brands/indiamart.webp" },
    { name: "XYXX", tile: "/images/brands/xyxx.webp" },
    { name: "Reactore", tile: "/images/brands/reactore.webp" },
    { name: "Padcare", tile: "/images/brands/padcare.webp" },
    { name: "Kerala Ayurveda", tile: "/images/brands/kerala-ayurveda.webp" },
    { name: "Prestige", tile: "/images/brands/prestige.webp" },
    { name: "Pathkind Labs", tile: "/images/brands/pathkind-labs.webp" },
  ] as { name: string; tile: string }[],
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
