import { HOMEPAGE } from "@/lib/pages";
import { ClassicHome } from "@/components/home/ClassicHome";
import { HomeV2 } from "@/components/home-v2/HomeV2";

/**
 * The homepage renders one of two designs, picked by HOMEPAGE in src/lib/pages.ts:
 *   "v2"      the temporary launch page (TV-static "draw an M" intro, hero, brands carousel, two form pop-ups)
 *   "classic" the full scrolling homepage (About, Impact, Work, Ideas, Testimonials, FAQ), kept intact
 */
export default function HomePage() {
  return HOMEPAGE === "v2" ? <HomeV2 /> : <ClassicHome />;
}
