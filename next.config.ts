import type { NextConfig } from "next";

const isBuild = process.env.NEXT_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isBuild ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
