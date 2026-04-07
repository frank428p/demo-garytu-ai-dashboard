import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/cms/:path*',
        destination: 'http://43.213.85.186/cms/:path*',
      },
    ]
  },
};

export default nextConfig;
