import type { Metadata } from "next";
import { PrefetchCrossZoneLinks, PrefetchCrossZoneLinksProvider } from "@vercel/microfrontends/next/client";
import { Header } from "@mfe-lite/ui";
import { LikesProvider } from "@mfe-lite/ui/likes";
import "@mfe-lite/ui/styles.css";

export const metadata: Metadata = {
  title: { default: "MFE Lite", template: "%s · MFE Lite" },
  description: "The smallest honest demo of Vercel Microfrontends.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <PrefetchCrossZoneLinksProvider>
          {/* This zone's likes store. On /horizontal the blog's embedded button writes into this one. */}
          <LikesProvider owner="shell">
            <Header zone="shell" />
            <main>{children}</main>
          </LikesProvider>
          <PrefetchCrossZoneLinks />
        </PrefetchCrossZoneLinksProvider>
      </body>
    </html>
  );
}
