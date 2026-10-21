import createMDX from 'fumadocs-mdx/config';
const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@node-rs/argon2'],
  images: {
    // domains: [
    //   'localhost',
    //   'avatars.githubusercontent.com',
    //   'lh6.googleusercontent.com',
    // ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
        port: '',
      },
    ],
  },
};
export default withMDX(nextConfig);
