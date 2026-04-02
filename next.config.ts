import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiUrl = process.env.API_URL;

    if (!apiUrl) {
      return [];
    }

    const apiBase = apiUrl.replace(/\/$/, "");

    return [
      {
        source: "/auth/:path*",
        destination: `${apiBase}/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
