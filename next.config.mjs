/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: 'openweathermap.org',
            port: '',
            pathname: '/img/**',
          },
        ],
    },    
};

export default nextConfig;
