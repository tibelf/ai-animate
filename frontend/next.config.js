const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
}

module.exports = nextConfig
