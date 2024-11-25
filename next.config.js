/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'bjuozchwgphxqrkjekpq.supabase.co',
      'm.media-amazon.com',
      'mobileimages.lowes.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bjuozchwgphxqrkjekpq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mobileimages.lowes.com',
        port: '',
        pathname: '/**',
      },
    ],
    deviceSizes: [160, 640, 750, 828, 1000, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 160],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Required for Vercel deployment
    esmExternals: true
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;