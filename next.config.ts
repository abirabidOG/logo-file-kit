import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/logo-kit",
        destination: "/",
        permanent: true,
      },
      {
        source: "/logofilekit",
        destination: "/",
        permanent: true,
      },
      {
        source: "/logo-file-kit",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
