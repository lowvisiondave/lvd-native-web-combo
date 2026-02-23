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
  async rewrites() {
    const appRouteMatcher = "/:path((?!_next(?:/|$)|api(?:/|$)|web(?:/|$)|native(?:/|$)|.*\\..*).*)";

    return [
      {
        source: appRouteMatcher,
        has: [{ type: "header", key: "x-native-app", value: "1" }],
        destination: "/native/:path"
      },
      {
        source: appRouteMatcher,
        destination: "/web/:path"
      }
    ];
  }
};

export default nextConfig;
