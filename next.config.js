// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  env: {
    CRON_SECRET: process.env.CRON_SECRET,
  },
};

module.exports = nextConfig;