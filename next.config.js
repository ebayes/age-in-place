/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bjuozchwgphxqrkjekpq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mobileimages.lowes.com',
        pathname: '/**',
      },
    ],
    deviceSizes: [160, 640, 750, 828, 1000, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 160],
  },
};

module.exports = nextConfig;