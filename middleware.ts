import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/contact",
  "/support",
  "/download",
  "/forgot-password",
  "/reset-password",
  "/reset-success",
];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("auth_token")?.value;
  const hasAuthCookie = Boolean(token);

  if (path === "/login" && hasAuthCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!hasAuthCookie && !isPublicPath(path)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
