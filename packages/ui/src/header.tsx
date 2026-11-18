// Shared header, rendered by each zone. The zone badge says which project rendered the page;
// the likes badge shows the count both zones share through the browser.
import { Link } from "@vercel/microfrontends/next/client";
import { LikesBadge } from "./likes/client";
import { Nav } from "./nav";
import { ZoneBadge, type Zone } from "./zone-badge";

export function Header({ zone }: { zone: Zone }) {
  return (
    <header className="header">
      <Link href="/" className="brand">
        <span className="brand-mark" aria-hidden="true" />
        MFE Lite
      </Link>
      <Nav />
      <div className="status">
        <LikesBadge />
        <ZoneBadge zone={zone} />
      </div>
    </header>
  );
}
