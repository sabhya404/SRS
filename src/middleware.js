import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/HomePage/:path*", "/authentication", "/LandingPage", "/"],
};

export async function middleware(request) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (
    token &&
    (url.pathname.startsWith("/authentication") ||
      url.pathname.startsWith("/Verify") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/HomePage", request.url));
  }

  if (
    !token &&
    (url.pathname.startsWith("/HomePage") || url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/LandingPage", request.url));
  }

  return NextResponse.next();
}
