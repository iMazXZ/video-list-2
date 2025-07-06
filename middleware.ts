// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  // Redirect unauthenticated users to signin page
  if (!token && pathname.startsWith("/admin")) {
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check for admin role on admin routes
  if (token && pathname.startsWith("/admin") && token.role !== "ADMIN") {
    // You can choose to redirect or show error
    return NextResponse.redirect(new URL("/", req.url));
    
    // OR show an error message
    // const errorUrl = new URL("/auth/error", req.url);
    // errorUrl.searchParams.set("message", "Admin access required");
    // return NextResponse.redirect(errorUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    // Add other protected paths if needed
  ],
};