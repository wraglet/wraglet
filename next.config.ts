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
      },
      {
        protocol: 'https',
        hostname: 'pub-c5365d46e2924ca2be4f4198d5b3d377.r2.dev'
      }
    ]
  }
}

export default nextConfig
