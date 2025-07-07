// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

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
  // =======================================================
  // TAMBAHAN BARU: EVENTS CALLBACK UNTUK DEBUGGING
  // =======================================================
  events: {
    async createUser(message) {
      console.log("--- createUser Event Triggered ---");
      console.log("Mencoba membuat user baru di database:", message.user);
      try {
        // Kita tidak perlu melakukan apa-apa di sini, karena adapter sudah melakukannya.
        // Blok ini hanya untuk memastikan event ini terpanggil.
        console.log("Event createUser selesai tanpa error yang terlihat.");
      } catch (error) {
        console.error("!!! ERROR SAAT EVENT createUser !!!", error);
      }
      console.log("====================================");
    },
    async linkAccount(message) {
        console.log("--- linkAccount Event Triggered ---");
        console.log("Menghubungkan akun ke user:", message.account);
        console.log("===================================");
    }
  },
  callbacks: {
    async signIn({ user }) {
      console.log("--- signIn Callback Triggered ---");
      console.log("Mengizinkan semua sign-in untuk debugging.");
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = user as User;
        token.id = dbUser.id;
        token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};