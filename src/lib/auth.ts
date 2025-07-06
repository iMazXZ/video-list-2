// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // Use Prisma to store user accounts, sessions, etc.
  adapter: PrismaAdapter(prisma),
  
  // Configure one or more authentication providers
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  // Use JWT for session management to enable custom callbacks
  session: {
    strategy: "jwt",
  },

  // Callbacks are used to control what happens when an action is performed.
  callbacks: {
    /**
     * This callback is called whenever a JWT is created (i.e., on sign in) 
     * or updated (i.e., whenever a session is accessed in the client).
     * We add the user's ID and role to the token here.
     */
    async jwt({ token, user }) {
      // The `user` object is only available on the first sign-in.
      // We persist the user's role and ID to the token.
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    /**
     * This callback is called whenever a session is checked.
     * We take the data from the token and make it available in the session object.
     */
    async session({ session, token }) {
      if (session.user) {
        // Add the custom properties from the token to the session
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },

    /**
     * This callback is called when a user signs in.
     * You can use it to restrict access.
     */
    async signIn({ user }) {
      // Example: Restrict access to a specific list of users
      const allowedEmails = ["akungamemaulana@gmail.com"];
      if (user.email && allowedEmails.includes(user.email)) {
        return true; // Allow sign-in
      }
      // You could return a URL to redirect unauthorized users
      return false; // Deny sign-in for everyone else
    }
  },

  // A secret is required for JWT signing
  secret: process.env.NEXTAUTH_SECRET,
  
  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",
};
