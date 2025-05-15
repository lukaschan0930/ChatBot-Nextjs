/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    async headers() {
        return [
            {
                source: "/api/auth/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS, PUT, DELETE" },
                    { key: "Access-Control-Allow-Headers", value: "Authorization, Content-Type" },
                ],
            },
        ];
    },
    images: {
        domains: ['edith.nyc3.cdn.digitaloceanspaces.com'],
        remotePatterns: [
            { hostname: "pbs.twimg.com" },
            { 
                protocol: 'https',
                hostname: "edith.nyc3.cdn.digitaloceanspaces.com",
                port: '',
                pathname: '/images/**',
            },
        ],
    },
    env: {
        DAILY_POOL: process.env.DAILY_POOL,
        RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
        CEREBRAS_API_KEY: process.env.CEREBRAS_API_KEY,
    },
    webpack: (config, options) => {
        if (options.nextRuntime === "edge") {
            if (!config.resolve.conditionNames) {
                config.resolve.conditionNames = ["require", "node"];
            }
            if (!config.resolve.conditionNames.includes("worker")) {
                config.resolve.conditionNames.push("worker");
            }
        }
        return config;
    },
};

export default nextConfig;