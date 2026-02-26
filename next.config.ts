import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for optimized Docker production builds
  output: "standalone",
  // Removed global API rewrite to allow Next.js API routes to work
  // Individual API routes now handle proxying to backend
};

export default nextConfig;
