import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
       allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const protectedRoutes = ["/dashboard"];

      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;