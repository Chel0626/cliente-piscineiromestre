import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'opulent-zebra-p9696vvqr4pf9wwq-3000.app.github.dev',
        '*.app.github.dev'
      ]
    }
  }
};

export default nextConfig;