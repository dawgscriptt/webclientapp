import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED = [
  /^\/friends(\/|$)/,
  /^\/messages(\/|$)/,
  /^\/settings(\/|$)/,
  /^\/tutor(\/|$)/,
  /^\/notifications(\/|$)/,
];

const ADMIN_ONLY = [/^\/admin(\/|$)/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow next internals + static
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/auth")
  ) {
    return NextResponse.next();
  }

  const needsAuth = PROTECTED.some((r) => r.test(pathname)) || ADMIN_ONLY.some((r) => r.test(pathname));
  if (!needsAuth) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // admin/mod only
  if (ADMIN_ONLY.some((r) => r.test(pathname))) {
    const role = (token as any).role as string | undefined;
    if (role !== "admin" && role !== "mod") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/friends/:path*",
    "/messages/:path*",
    "/settings/:path*",
    "/tutor/:path*",
    "/notifications/:path*",
    "/admin/:path*",
  ],
};
