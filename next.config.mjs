/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Disable strict mode for better compatibility
  reactStrictMode: true,
  
  // Enable SWC minification
  swcMinify: true,
  
  // Configure images domain if needed
  images: {
    domains: ['localhost', '192.168.50.180'],
    unoptimized: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  
  // Experimental features
  experimental: {
    // Enable app directory
    appDir: true,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
