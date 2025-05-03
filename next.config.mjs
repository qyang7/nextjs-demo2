/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: true, // Set to true for a 308 redirect, false for a 307 redirect
            },
        ];
    },
};

export default nextConfig;