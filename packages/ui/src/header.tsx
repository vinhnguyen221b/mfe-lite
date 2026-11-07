// Shared header. Links use the microfrontends Link: inside a zone it behaves like next/link,
// across zones it becomes a full navigation (and can be prefetched with PrefetchCrossZoneLinks).
import { Link } from "@vercel/microfrontends/next/client";
import { ZoneBadge, type Zone } from "./zone-badge";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
];

export function Header({ zone }: { zone: Zone }) {
  return (
    <header className="header">
      <Link href="/" className="brand">
        MFE Lite
      </Link>
      <nav className="nav">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <ZoneBadge zone={zone} />
    </header>
  );
}
