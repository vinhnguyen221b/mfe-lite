// Blog proxy: stamps every response this zone serves with x-mfe-zone: blog.
// Only the paths this zone owns are matched; it never sees the shell's "/".
import { NextResponse } from "next/server";

export function proxy() {
  const response = NextResponse.next();
  response.headers.set("x-mfe-zone", "blog");
  return response;
}

export const config = {
  matcher: ["/blog", "/blog/:path*", "/docs", "/docs/:path*"],
};
