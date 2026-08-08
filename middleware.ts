import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // アプリ配下はログイン必須
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/pdf") ||
    pathname.startsWith("/admin")
  ) {
    const token = req.cookies.get("ss_session")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/pdf/:path*",
    "/admin/:path*",
    "/login",
    "/api/:path*",
  ]
};
