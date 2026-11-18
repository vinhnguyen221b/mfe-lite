import type { NextConfig } from "next";
import { withMicrofrontends } from "@vercel/microfrontends/next/config";
import { withRemoteComponentsConfig } from "remote-components/config/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@mfe-lite/ui"],
};

// Child zone: no basePath, routes mirror their path under app/ (app/blog, app/docs, app/components).
// withMicrofrontends locates microfrontends.json in the default app and sets this app's asset prefix.
// withRemoteComponentsConfig lets the pages under app/components be embedded in a shell page.
export default withRemoteComponentsConfig(withMicrofrontends(nextConfig), {
  // One live copy of the likes context: on a shell page, the blog's import resolves to the shell's module.
  shared: ["@mfe-lite/ui/likes-context"],
});
