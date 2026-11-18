import type { NextConfig } from "next";
import { withMicrofrontends } from "@vercel/microfrontends/next/config";
import { withRemoteComponentsConfig } from "remote-components/config/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@mfe-lite/ui"],
};

// withMicrofrontends reads microfrontends.json, injects MFE_CONFIG and
// NEXT_PUBLIC_MFE_CURRENT_APPLICATION at build time, and gives this app a hashed
// asset prefix (vc-ap-<hash>) so its /_next assets never collide with the blog zone's.
// withRemoteComponentsConfig lets /horizontal embed components rendered by the blog zone.
export default withRemoteComponentsConfig(withMicrofrontends(nextConfig), {
  // One live copy of the likes context: on a shell page, the blog's import resolves to the shell's module.
  shared: ["@mfe-lite/ui/likes-context"],
});
