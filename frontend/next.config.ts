import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  // Allow access from local network (for mobile testing)
  experimental: {
    allowedDevOrigins: ['192.168.0.80:3000'],
  },
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
