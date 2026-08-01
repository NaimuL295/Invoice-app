// src/middleware.ts

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export const middleware = auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create/:path*",
    "/modify/:path*",
    "/profile/:path*",
    "/print-settings/:path*",
   "/products/create/:path*",
  "/allproducts/:path*",
   "/transaction/:path*",
    "/transaction-history/:path*",
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
