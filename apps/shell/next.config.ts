import type { NextConfig } from "next";
import { withMicrofrontends } from "@vercel/microfrontends/next/config";

const nextConfig: NextConfig = {
  transpilePackages: ["@mfe-lite/ui"],
};

// withMicrofrontends reads microfrontends.json, injects MFE_CONFIG and
// NEXT_PUBLIC_MFE_CURRENT_APPLICATION at build time, and gives this app a hashed
// asset prefix (vc-ap-<hash>) so its /_next assets never collide with the blog zone's.
export default withMicrofrontends(nextConfig);
