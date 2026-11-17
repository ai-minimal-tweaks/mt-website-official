import { site } from "@/lib/site";
import { jsonLd } from "@/lib/security/json-ld";
import { Experience } from "./Experience";

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  email: site.email,
  telephone: site.phones[0],
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address,
    addressCountry: "IN",
  },
  sameAs: [
    "https://www.instagram.com/minimal_tweaks",
    "https://in.linkedin.com/company/minimaltweaks",
    "https://twitter.com/minimaltweaks",
  ],
};

/** Temporary homepage ("MT Homepage v2-temporary"). Switch back with HOMEPAGE in src/lib/pages.ts. */
export function HomeV2() {
  return (
    <>
      <Experience />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(orgSchema) }} />
    </>
  );
}
