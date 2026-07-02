import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Genera build autónomo compatible con Docker/ECS — solo incluye lo necesario
  output: "standalone",

  images: {
    remotePatterns: [
      // Supabase Storage (cuando subas las imágenes ahí)
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // CloudFront (cuando configures CDN en AWS)
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
