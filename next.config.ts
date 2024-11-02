import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['ably', 'mongoose'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-6ac8e2b161f54ddc9fd2a84f09bb4bdb.r2.dev'
      },
      {
        protocol: 'https',
        hostname: 'wraglet-s3-local.s3.ap-southeast-1.amazonaws.com'
      }
    ]
  }
}

export default nextConfig
