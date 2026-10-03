import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the Turbopack root to this repo. Without it Next.js infers the root
  // from the orphan lockfile at ~/package-lock.json and scans the whole home
  // directory, which made first-compile take minutes per route.
  turbopack: {
    root: path.join(__dirname),
  },

  // Allow external image sources (for product image_url)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
