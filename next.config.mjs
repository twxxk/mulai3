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
          {
            protocol: 'https',
            hostname: 'oaidalleapiprodscus.blob.core.windows.net',
            port: '',
            pathname: '/private/org-t6YbspjApFkQzpyeG5NwqFZD/user-X8vbPtNgIX4CApiHOzSYy0KH/**',
          },
        ],
    },    
};

export default nextConfig;
