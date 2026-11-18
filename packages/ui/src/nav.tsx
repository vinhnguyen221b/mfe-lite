"use client";

// Header navigation. Links use the microfrontends Link: inside a zone it behaves like next/link,
// across zones it becomes a full navigation (and can be prefetched with PrefetchCrossZoneLinks).
import { usePathname } from "next/navigation";
import { Link } from "@vercel/microfrontends/next/client";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
  { href: "/horizontal", label: "Horizontal" },
];

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="nav" aria-label="Main">
      {NAV.map((item) => (
        <Link key={item.href} href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
