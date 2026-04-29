// Middleware: redirecționează toate cererile de pe www.familygarden.ro la familygarden.ro (canonical)
// + forțează HTTPS
import { NextResponse } from "next/server";

export function middleware(request) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Redirect www → apex (familygarden.ro)
  if (host.startsWith("www.")) {
    url.host = host.replace(/^www\./, "");
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  // Aplica middleware-ul la toate rutele EXCEPTÂND cele statice/asseturi
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
