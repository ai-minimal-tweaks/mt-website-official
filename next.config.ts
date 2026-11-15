import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Every live URL on minimaltweaks.com resolves without a trailing slash; keep parity.
  trailingSlash: false,
  // The CMS store reads /data at runtime (fs, not import), so tell output tracing to ship it with every
  // server function. Without this, serverless hosts deploy the functions without the case-study data.
  outputFileTracingIncludes: { "/**": ["./data/**/*"] },
  images: {
    // Case-study imagery is still served from the current Webflow CDN. Move these files into /public
    // (or the new CMS) before the Webflow site is switched off.
    remotePatterns: [{ protocol: "https", hostname: "cdn.prod.website-files.com" }],
  },
  async redirects() {
    return [
      // The contact page moved from /talk to /contact in the revamp.
      { source: "/talk", destination: "/contact", permanent: true },
      // The about page moved from /tweakers to /about in the revamp.
      { source: "/tweakers", destination: "/about", permanent: true },
      // The live site never had a case-study index; /work is the listing.
      { source: "/case-studies", destination: "/work", permanent: true },
    ];
  },
};

export default nextConfig;
