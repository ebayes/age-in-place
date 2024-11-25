/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'bjuozchwgphxqrkjekpq.supabase.co',
      'm.media-amazon.com',
      'mobileimages.lowes.com'
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    outputFileTracingRoot: process.env.VERCEL ? undefined : process.cwd(),
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-*/**/*',
        'node_modules/@esbuild/**/*',
        '.next/**/*',
        '**/*.{json,md,txt,log,lock}'
      ],
    },
  }
};

module.exports = nextConfig;