import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed global API rewrite to allow Next.js API routes to work
  // Individual API routes now handle proxying to backend
};

export default nextConfig;
