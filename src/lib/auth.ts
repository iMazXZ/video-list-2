// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

// Definisikan daftar email admin di satu tempat agar mudah dikelola
const ADMIN_EMAILS = ["akungamemaulana@gmail.com"];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * Callback `jwt` ini adalah kunci utamanya.
     * Ia dipanggil setiap kali token JWT dibuat atau diperbarui.
     */
    async jwt({ token, user }) {
      // `user` hanya ada saat pertama kali login.
      if (user) {
        // 1. Ambil data terbaru dari database untuk memastikan kita punya peran (role) yang benar.
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        });

        // 2. Jika user ada di database, teruskan perannya ke token.
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    /**
     * Callback `session` mengambil data dari token dan menyediakannya untuk sisi klien.
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    /**
     * Event `createUser` dipanggil SETELAH adapter berhasil membuat user baru.
     * Di sinilah kita menetapkan peran ADMIN untuk pertama kalinya.
     */
    async createUser({ user }) {
      const userEmail = user.email;

      if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    },
  },
  pages: {
    // Arahkan ke halaman error kustom jika login gagal
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
