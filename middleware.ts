import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow driver login and register - never intercept these
  if (pathname === "/driver/login" || pathname === "/driver/register") {
    return NextResponse.next();
  }

  // Driver protected routes
  const driverProtectedPaths = [
    "/driver/dashboard",
    "/driver/vehicles",
    "/driver/revenue",
    "/driver/reviews",
    "/driver/payments",
    "/driver/settings",
  ];

  // User protected routes
  const userProtectedPaths = [
    "/user/dashboard",
    "/user/bookings",
    "/user/profile",
  ];

  const isDriverProtected = driverProtectedPaths.some((path) =>
    pathname.startsWith(path),
  );
  const isUserProtected = userProtectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  const driverToken = request.cookies.get("driver-token")?.value;
  const userToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // Redirect unauthenticated drivers
  if (isDriverProtected && !driverToken) {
    return NextResponse.redirect(new URL("/driver/login", request.url));
  }

  // Redirect unauthenticated users
  if (isUserProtected && !userToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If driver is logged in and tries to access driver login/register, redirect to dashboard
  if (
    driverToken &&
    (pathname === "/driver/login" || pathname === "/driver/register")
  ) {
    return NextResponse.redirect(new URL("/driver/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/driver/:path*", "/user/:path*"],
};
