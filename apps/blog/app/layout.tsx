import type { Metadata } from "next";
import { PrefetchCrossZoneLinks, PrefetchCrossZoneLinksProvider } from "@vercel/microfrontends/next/client";
import { Header } from "@mfe-lite/ui";
import { LikesProvider } from "@mfe-lite/ui/likes";
import "@mfe-lite/ui/styles.css";

export const metadata: Metadata = {
  title: { default: "MFE Lite", template: "%s · MFE Lite" },
  description: "Blog zone of the MFE Lite demo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <PrefetchCrossZoneLinksProvider>
          {/* This zone's likes store, for blog pages. Embedded in a shell page, blog components use the shell's. */}
          <LikesProvider owner="blog">
            <Header zone="blog" />
            <main>{children}</main>
          </LikesProvider>
          <PrefetchCrossZoneLinks />
        </PrefetchCrossZoneLinksProvider>
      </body>
    </html>
  );
}
