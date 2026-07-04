import type { NextConfig } from "next";

const RAILWAY_API = process.env.RAILWAY_API_URL ?? "https://colonta-api-production.up.railway.app";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  output: "standalone",

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${RAILWAY_API}/api/:path*`,
      },
    ];
  },

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
