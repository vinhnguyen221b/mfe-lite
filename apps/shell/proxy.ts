// Shell proxy (Next.js 16 "proxy" = middleware). One job: stamp every response the shell
// serves with x-mfe-zone: shell. It never runs for /blog/* or /docs/*: those paths belong to the
// blog zone, and Vercel's routing layer sends them there before the shell is reached.
import { NextResponse } from "next/server";

export function proxy() {
  const response = NextResponse.next();
  response.headers.set("x-mfe-zone", "shell");
  return response;
}

export const config = {
  matcher: [
    // The shell's own pages. Exclude framework assets, the blog's asset prefix (vc-ap-*)
    // and the blog's paths, otherwise this proxy would shadow them.
    "/((?!_next/|vc-ap-|favicon.ico|blog/|blog$|docs/|docs$).*)",
  ],
};
