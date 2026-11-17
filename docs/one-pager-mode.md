# One-pager mode

Since November 2026 the public site runs as a **one-page website**: only the homepage (`/`) is visible.
All other pages are still in the code and still build. They are only hidden from visitors.

## What is hidden
`/work`, `/work/case-study/*`, `/services`, `/about`, `/testimonials`, `/contact`, the old `/case-studies/*`
addresses and `/become-a-tweaker`. The CMS at `/admin` is **not** affected.

## How it is hidden (all driven by one flag)
The switch is `ONE_PAGER` in [`src/lib/pages.ts`](../src/lib/pages.ts). While it is `true`:

| Where | Behaviour |
| --- | --- |
| Header nav, mobile menu, "Start a project" | Scroll to homepage sections: Work → `#work`, Services → `#ideas`, About → `#about`, Testimonials → `#testimonials`, Contact → `#contact` (the footer) |
| `Pill` buttons anywhere | Same section mapping. "Book a discovery call" opens an email instead |
| Case-study cards, testimonial "Case study" links | Render without a link (no section to point to) |
| "View all work" links | Hidden |
| Footer link columns | Links to hidden pages are left out |
| Visiting a hidden URL directly | `src/proxy.ts` sends a temporary (307) redirect to `/`. Signed-in CMS admins can still open them to preview |

## To unhide all pages
"Unhide all the other pages" / "turn off one-pager mode" means:

1. In `src/lib/pages.ts`, set `export const ONE_PAGER = false;`
2. Build and deploy. No other change is needed: every link, redirect and footer column reads the flag.

To unhide only some pages, remove those paths from `HIDDEN_PAGES` in the same file instead. A page with a
homepage section stand-in also has an entry in `SECTION_FOR_PAGE`; that entry can stay.

## Temporary homepage (v2)
Separately from one-pager mode, the homepage itself has two designs, chosen by `HOMEPAGE` in
[`src/lib/pages.ts`](../src/lib/pages.ts):

- `"v2"` (live now): the temporary launch page from the "MT Homepage v2-temporary" design. Visitors see TV
  static and draw an M (mouse drag or finger) to tune in; the page then zooms out into a single screen with
  the hero, a brands carousel and two pop-up forms ("Start a project", "Request our deck"). Phones get a
  game-like "channel" layout. Code: `src/components/home-v2/`.
- `"classic"`: the full scrolling homepage (Hero, About, Impact, Work, Ideas, Testimonials, FAQ, footer).
  Code: `src/components/home/ClassicHome.tsx`.

"Bring back the old homepage" / "remove the temporary homepage" means setting `HOMEPAGE = "classic"`.
When the other pages are unhidden as well, also set `ONE_PAGER = false`: the classic homepage links to them.

Both forms post to `/api/contact`, which emails every enquiry through Resend (`RESEND_API_KEY` in Vercel).
Sender (`contact@minimaltweaks.com`) and recipients (anshul@ and shubham@minimaltweaks.com) are set in
`src/lib/email/config.ts`; `CONTACT_FROM` / `CONTACT_TO` env vars override them without a code change.
