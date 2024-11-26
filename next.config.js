/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'bjuozchwgphxqrkjekpq.supabase.co',
      'm.media-amazon.com',
      'mobileimages.lowes.com'
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Updated from experimental.serverComponentsExternalPackages
  serverExternalPackages: ['@prisma/client']
};

module.exports = nextConfig;