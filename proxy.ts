// src/proxy.ts

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// সরাসরি 'auth' কে 'proxy' নামে এক্সপোর্ট করা হলো (আপনার রিকোয়েস্ট অনুযায়ী)
export const proxy = auth;

// Next.js Middleware-এর জন্য এটাকে 'middleware' নামেই এক্সপোর্ট করতে হবে
export const middleware = auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};