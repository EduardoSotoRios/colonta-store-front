import type { NextConfig } from "next";

const RAILWAY_API = process.env.RAILWAY_API_URL ?? "https://colonta-api-sz8z.onrender.com";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Server-only vars: read at build time (Amplify Console vars are available
  // during next build) and inlined into the server bundle, so the SSR Lambda
  // receives them even if runtime env injection fails.
  env: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    CLOUDINARY_API_SECRET:     process.env.CLOUDINARY_API_SECRET     ?? "",
    CLOUDINARY_API_KEY:        process.env.CLOUDINARY_API_KEY        ?? "",
    CLOUDINARY_CLOUD_NAME:     process.env.CLOUDINARY_CLOUD_NAME     ?? "",
    ADMIN_VERIFY_PIN:          process.env.ADMIN_VERIFY_PIN          ?? "",
    RAILWAY_API_URL:           process.env.RAILWAY_API_URL           ?? "https://colonta-api-sz8z.onrender.com",
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },

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
