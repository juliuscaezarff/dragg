import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typedRoutes: true,
    reactCompiler: true,
    async redirects() {
        return [
            {
                source: "/dashboard",
                destination: "/app",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
