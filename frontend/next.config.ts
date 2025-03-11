/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['neozeavfazvjjfqfllal.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
