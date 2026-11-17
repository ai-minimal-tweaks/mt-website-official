import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Impact } from "@/components/home/Impact";
import { Work } from "@/components/home/Work";
import { Ideas } from "@/components/home/Ideas";
import { Testimonials } from "@/components/home/Testimonials";
import { Faq } from "@/components/home/Faq";
import { site } from "@/lib/site";
import { jsonLd } from "@/lib/security/json-ld";

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  email: site.email,
  telephone: site.phones[0],
  address: { "@type": "PostalAddress", streetAddress: site.address, addressCountry: "IN" },
  sameAs: ["https://www.instagram.com/minimal_tweaks", "https://in.linkedin.com/company/minimaltweaks", "https://twitter.com/minimaltweaks"],
};

export default function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <About />
        <Impact />
        <Work />
        <Ideas />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(orgSchema) }} />
    </>
  );
}
