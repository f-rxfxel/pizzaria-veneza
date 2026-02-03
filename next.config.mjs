/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
    allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.15.11:3000'
  ],
  experimental: {
    turbo: false,
  },
}

export default nextConfig
