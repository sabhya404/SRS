import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/HomePage/:path*", "/authentication", "/LandingPage", "/"],
};

export async function middleware(request) {
  const token = await getToken({ req: request });
  console.log("Token from cookies:", token);
  const url = request.nextUrl;

  // Create a response to modify if needed
  const response = NextResponse.next();

  //Check if user is authenticated but not verified
  if (token && !token.emailVerified && !url.pathname.startsWith("/verify")) {
    return NextResponse.redirect(new URL("/verify", request.url));
    9;
  }

  // Redirect logged-in and verified users away from authentication pages
  if (
    token &&
    token.emailVerified &&
    (url.pathname.startsWith("/authentication") ||
      url.pathname.startsWith("/LandingPage") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/HomePage", request.url));
  }

  // Keep unverified users on verification page even when logged in
  if (token && !token.emailVerified && url.pathname.startsWith("/verify")) {
    return response;
  }

  // Redirect unauthenticated users trying to access protected routes
  if (
    !token &&
    (url.pathname.startsWith("/HomePage") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/LandingPage", request.url));
  }

  return response;
}
