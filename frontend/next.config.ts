import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/generate',
        destination: '/create-recipe',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
