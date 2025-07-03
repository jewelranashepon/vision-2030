/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optional: Add this if you want to ignore TypeScript errors during build
    ignoreBuildErrors: true, // Remove this line for production
  },
  images: {
    unoptimized: true,
  },
  // External packages for Server Components (new format)
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  // Experimental features (if any)
  experimental: {
    // Add any other experimental features you're using here
  },
  // Optional: Output standalone build for Docker
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
};

module.exports = nextConfig;
