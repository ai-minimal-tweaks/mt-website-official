// Copy for the temporary v2 homepage ("MT Homepage v2-temporary" design). See HOMEPAGE in src/lib/pages.ts.

export const homeV2 = {
  tagline: "Creative agency in Gurugram",
  headline: { lead: "creative work needs", struck: "a lot of", accent: "minimal tweaks" },
  sub: "Ads, campaigns and content for brands that can’t afford average.",
  ctas: { deck: "Request our deck", project: "Start a project" },
  brandsLabel: "Brands we’ve tweaked",
  /** `live`: an account we're running right now (green "Live" tag). Order = carousel order. */
  brands: [
    { name: "MakeMyTrip", live: true },
    { name: "Kerala Ayurveda", live: false },
    { name: "IndiaMART", live: true },
    { name: "upGrad", live: false },
    { name: "XYXX", live: true },
    { name: "OZi", live: false },
  ],
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
