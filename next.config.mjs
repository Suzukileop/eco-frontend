const nodeStub = './lib/stubs/empty-module.js';

function buildImageRemotePatterns() {
  const patterns = [
    {
      protocol: 'https',
      hostname: '**.googleusercontent.com',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
    {
      protocol: 'https',
      hostname: '**.r2.dev',
    },
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8080',
      pathname: '/api/storage/**',
    },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      const protocol = parsed.protocol.replace(':', '');
      if (protocol === 'http' || protocol === 'https') {
        patterns.push({
          protocol,
          hostname: parsed.hostname,
          ...(parsed.port ? { port: parsed.port } : {}),
          pathname: '/api/storage/**',
        });
      }
    } catch {
      // ignore invalid NEXT_PUBLIC_API_URL
    }
  }

  return patterns;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      '@hookform/resolvers',
      'react-hook-form',
      'recharts',
      'react-markdown',
    ],
    turbo: {
      // Ne pas aliaser fs/path ici : Turbopack applique resolveAlias aussi côté serveur
      // et Next.js a besoin du vrai module `path` (normalizePagePath, etc.).
      resolveAlias: {
        canvas: nodeStub,
      },
    },
  },
  images: {
    remotePatterns: buildImageRemotePatterns(),
  },
  transpilePackages: ['gl-transition', 'gl-texture2d', 'remotion', '@remotion/player'],
  webpack: (config, { dev }) => {
    if (dev) {
      config.output = {
        ...config.output,
        // Dev webpack uniquement — évite ChunkLoadError sur grosses routes (ex. analytics).
        chunkLoadTimeout: 120_000,
      };
    }
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
