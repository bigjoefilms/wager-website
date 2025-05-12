import type { NextConfig } from "next";
require('dotenv').config();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_PRIVATE_KEY: process.env.NEXT_PUBLIC_PRIVATE_KEY,
  },
  /* config options here */
};

export default nextConfig;
