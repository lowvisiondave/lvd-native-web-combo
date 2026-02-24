/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/bridge"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://images.unsplash.com",
              "connect-src 'self' ws:",
              "frame-ancestors 'none'"
            ].join("; ")
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [];
  }
};

export default nextConfig;
