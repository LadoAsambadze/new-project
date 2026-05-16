import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/graphql', '') ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/upload/:path*',
        destination: `${BACKEND_URL}/upload/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
