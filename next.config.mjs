/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Prisma 7 يولّد العميل إلى src/generated/prisma
  // نضمن تضمينه في bundle الـserverless functions على Vercel
  outputFileTracingIncludes: {
    "/api/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
