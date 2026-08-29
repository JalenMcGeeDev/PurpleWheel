import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.219"],
  // Prevent Supabase from being bundled into client-side chunks
  serverExternalPackages: ["@supabase/supabase-js"],
};

export default nextConfig;
