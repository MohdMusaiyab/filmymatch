import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thumbs.dreamstime.com',
      },
      {
        protocol: 'https',
        hostname: 'snippit-user-media.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
