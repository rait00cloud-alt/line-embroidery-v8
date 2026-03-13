import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
     typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack(config, { dev }) {
    if (!dev) {
      config.devtool = false; 
    }
    return config;
  },

  
  productionBrowserSourceMaps: false,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
