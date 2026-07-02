import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Genera build autónomo compatible con Docker/ECS — solo incluye lo necesario
  output: "standalone",

  images: {
    remotePatterns: [
      // Cloudinary
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Supabase Storage (legado)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
