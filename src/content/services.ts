// Services page copy, from the new design. Pillars mirror the homepage "Ideas" cards.

export const pillars = [
  {
    id: "creative-thinking",
    title: ["Creative", "Thinking"],
    tagline: "Turning briefs into ideas worth making.",
    included: ["Creative Concepts", "Content Ideas", "Creative Directions", "Campaign Ideas"],
    deliverables: ["Campaign concepts and creative routes", "Content pillars and formats", "Creative direction decks", "Launch and moment ideas"],
    related: "finsense",
  },
  {
    id: "creative-scale",
    title: ["Creative", "Scale"],
    tagline: "Creative without the format limits.",
    included: ["Static / Video", "Product Content", "AI / CGI", "Performance Content"],
    deliverables: ["Static and video assets in every format", "Product shoots and renders", "Ad variations for testing", "Monthly content production"],
    related: "crunchy-cashews",
  },
  {
    id: "brand-content",
    title: ["Brand", "Content"],
    tagline: "Making brands part of the conversation.",
    included: ["Social-first", "Topical Moments", "Storytelling", "Content IPs"],
    deliverables: ["Social calendars and always-on content", "Topical and moment marketing", "Brand stories and series", "Owned content IPs"],
    related: "crex",
  },
];

export const processSteps = [
  { title: "Discover", body: "We learn the brand, the audience and the market before we pitch a single idea." },
  { title: "Define", body: "One clear strategy and creative platform, agreed with you up front." },
  { title: "Design", body: "Concepts, content and campaigns, reviewed with you every week." },
  { title: "Deliver", body: "We ship, measure what changed and tweak what's next." },
];

// Typical engagement lengths are marked "[confirm]" in the design — add `length` once agreed.
export const engagements = [
  {
    name: "Project",
    bestFor: "Best for a defined piece of work",
    body: "A brand identity, a campaign or a launch, with a clear start and end.",
    points: ["Fixed scope and timeline", "One team from brief to delivery"],
  },
  {
    name: "Sprint",
    bestFor: "Best for testing an idea fast",
    body: "A short, focused burst to try a new format, a campaign idea or a fix.",
    points: ["Tight scope, weekly reviews", "Ideas to live assets quickly"],
    highlight: true,
  },
  {
    name: "Retainer",
    bestFor: "Best for brands that ship every week",
    body: "An ongoing creative team for content, social and campaigns.",
    points: ["Monthly scope you can flex", "Same team, month after month"],
  },
];
