import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Room for a 4 MB thumbnail (lib/thumbnail-limits.ts) plus the rest of the form.
      // Vercel rejects request bodies above 4.5 MB regardless of this setting.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
