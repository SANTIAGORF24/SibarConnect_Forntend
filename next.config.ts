import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

    return [
      {
        source: "/media/:path*",
        destination: `${apiBaseUrl}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
