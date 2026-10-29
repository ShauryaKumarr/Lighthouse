import type { NextConfig } from "next";

const basePath = process.env.GITHUB_ACTIONS ? "/Lighthouse" : "";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves under /Lighthouse; Vercel/local stay at root
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
