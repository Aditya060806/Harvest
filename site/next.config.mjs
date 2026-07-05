/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The site is nested inside the main package repo; skip lint during build so a
  // hoisted ESLint version can't break the Vercel build. Linting is done on the
  // main package separately.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
