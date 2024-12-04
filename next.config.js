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
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  serverExternalPackages: []
};

module.exports = nextConfig;