import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy: only the origins the site really uses.
 *  • scripts: our own + the tags inside the GTM container (GTM-5R542TZ: Google Ads conversions, Universal Analytics,
 *    Microsoft Clarity). Add a domain here when a new vendor tag is added in GTM. 'unsafe-inline' is needed for Next.js' inline bootstrap scripts on
 *    statically generated pages (nonces would force every page to render on demand); dev also needs 'unsafe-eval'.
 *  • images/video: any https source, because CMS editors may paste media URLs from other hosts.
 *  • frames: YouTube (no-cookie) and Vimeo players in case studies, plus GTM's noscript frame.
 *  • connect: any https (analytics and ad beacons go to many Google domains; CMS uploads go to Vercel Blob).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://*.clarity.ms`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  // connect: any https endpoint. Google Ads reports conversions to the visitor's country domain (google.co.in,
  // google.co.uk, …) and GA4 to analytics.google.com, so a host list can't be complete. Script execution stays
  // locked down by script-src above, which is what stops injected code.
  `connect-src 'self' https:${dev ? " ws:" : ""}`,
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.googletagmanager.com https://*.doubleclick.net",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework in an X-Powered-By header.
  poweredByHeader: false,
  // Every live URL on minimaltweaks.com resolves without a trailing slash; keep parity.
  trailingSlash: false,
  // The CMS store reads /data at runtime (fs, not import), so tell output tracing to ship it with every
  // server function. Without this, serverless hosts deploy the functions without the case-study data.
  outputFileTracingIncludes: { "/**": ["./data/**/*"] },
  images: {
    // Case-study imagery is still served from the current Webflow CDN. Move these files into /public
    // (or the new CMS) before the Webflow site is switched off.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      // CMS uploads on Vercel Blob.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The CMS and its API are never indexed or cached by browsers and proxies.
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/cms/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
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
