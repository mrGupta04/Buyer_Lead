// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Enable static exports for the App Router
  output: 'standalone',
  // Ensure compiler includes styled-jsx in the compilation
  compiler: {
    styledComponents: true,
  },
}

export default nextConfig