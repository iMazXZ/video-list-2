import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    console.log("User authenticated, accessing:", req.nextUrl.pathname);
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};