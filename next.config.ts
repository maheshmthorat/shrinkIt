/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://192.168.2.27:3000", // Replace with your LAN IP + port
  ],
};

module.exports = nextConfig;
