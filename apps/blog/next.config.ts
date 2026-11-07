import type { NextConfig } from "next";
import { withMicrofrontends } from "@vercel/microfrontends/next/config";

const nextConfig: NextConfig = {
  transpilePackages: ["@mfe-lite/ui"],
};

// Child zone: no basePath, routes mirror their path under app/ (app/blog, app/docs).
// withMicrofrontends locates microfrontends.json in the default app and sets this app's asset prefix.
export default withMicrofrontends(nextConfig);
