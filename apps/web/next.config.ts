import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@nexushub/shared-types'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }],
  },
};

export default nextConfig;
