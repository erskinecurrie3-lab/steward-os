/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mitigate ChunkLoadError: split layout from heavy provider chunks
  experimental: {
    // Optimize chunk loading
    optimizePackageImports: ["@clerk/nextjs"],
  },
};

export default nextConfig;
