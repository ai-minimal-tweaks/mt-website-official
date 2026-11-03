import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Every live URL on minimaltweaks.com resolves without a trailing slash; keep parity.
  trailingSlash: false,
};

export default nextConfig;
