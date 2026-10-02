/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // genome-schema and ui-tokens are workspace TS packages; let Next transpile them.
  transpilePackages: ["@kapra/genome-schema", "@kapra/ui-tokens"],
  async rewrites() {
    const engine = process.env.ENGINE_INTERNAL_URL ?? "http://localhost:8000";
    return [{ source: "/api/engine/:path*", destination: `${engine}/:path*` }];
  },
};

export default nextConfig;
