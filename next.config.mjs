/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js ships untranspiled ESM; Next handles it, but transpiling the R3F
  // ecosystem avoids occasional interop breakage on the server render pass.
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
