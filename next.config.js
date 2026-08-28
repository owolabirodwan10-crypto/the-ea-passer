/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Enable verbose logging to see the actual error
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // ✅ Show full error messages in production (temporarily)
  productionBrowserSourceMaps: true,
  // ✅ Disable React strict mode to reduce noise
  reactStrictMode: false,
}

module.exports = nextConfig