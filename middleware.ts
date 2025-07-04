export { default } from "next-auth/middleware";

export const config = {
  // Lindungi semua route yang diawali dengan /admin
  matcher: ["/admin/:path*"], 
};