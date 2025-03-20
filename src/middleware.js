import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/HomePage/:path*", "/authentication", "/LandingPage", "/"],
};

export async function middleware(request) {
  const token = await getToken({ req: request });
  console.log("Token from cookies:", token);
  const url = request.nextUrl;

  // If needed, you can create a response and set headers manually:
  const response = NextResponse.next();

  // For example, setting an Authorization header if token exists
  // if (token) {
  //   response.headers.set("Authorization", `Bearer ${token}`);
  // }

  // Redirect logged-in users away from authentication pages
  if (
    token &&
    (url.pathname.startsWith("/authentication") ||
      url.pathname.startsWith("/LandingPage") ||
      url.pathname.startsWith("/Verify") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/HomePage", request.url));
  }

  // Redirect unauthenticated users trying to access protected routes
  if (
    !token &&
    (url.pathname.startsWith("/HomePage") || url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/LandingPage", request.url));
  }

  return response;
}
