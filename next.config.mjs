/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['gl-transition', 'gl-texture2d', 'remotion', '@remotion/player'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      canvas: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
