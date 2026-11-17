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
    done: { title: "Signal received.", body: "Thanks — we’ll read your brief and get back to you within one working day." },
  },
  deck: {
    title: "Request Deck",
    submit: "Request Deck",
    done: { title: "Deck incoming.", body: "Thanks — we’ll send our deck to your inbox shortly." },
  },
} as const;
