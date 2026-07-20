import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pub-c6773809bf7a4018b9e4e2ffb566b108.r2.dev",
      },
    ],
  },
};

export default nextConfig;
