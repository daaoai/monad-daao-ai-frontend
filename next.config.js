/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  distDir: 'build',
  images: {
    unoptimized: true,
  },
  sassOptions: {
    additionalData: `$var: red;`,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      pino: false,
      'pino-pretty': false,
    };
    return config;
  },
  // @devs please don't remove this commented code

  // Adding the rewrites for the Conduit API
  async rewrites() {
    return [
      {
        source: '/api/conduit/:path*',
        destination: 'https://explorer-mode-mainnet-0.t.conduit.xyz/api/:path*',
      },
      {
        source: '/api/dexscreener/:path*',
        destination: 'https://api.dexscreener.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
