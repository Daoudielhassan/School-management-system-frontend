import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    // ESLint only just got a working config (see eslint.config.mjs) and
    // surfaced ~2860 pre-existing errors unrelated to any single change.
    // Lint runs separately in CI as a non-blocking step; keep `build`
    // reflecting compile validity only until that backlog is triaged.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;