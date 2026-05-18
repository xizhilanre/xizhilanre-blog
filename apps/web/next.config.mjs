/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@xizhilanre/ui', '@xizhilanre/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
