import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@culi/core', '@culi/db', '@culi/theme-sdk', '@culi/config'],
};

export default nextConfig;
