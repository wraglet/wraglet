/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.ap-southeast-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com'
      }
    ]
  }
};

module.exports = nextConfig;
