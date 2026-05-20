/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable image optimization for simpler deployment
  images: {
    unoptimized: true,
  },
  // Configure API routes
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

module.exports = nextConfig;
