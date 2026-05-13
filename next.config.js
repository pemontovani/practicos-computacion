/** @type {import('next').NextConfig} */
const { version } = require('./package.json')

const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
