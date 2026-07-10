
// auth.ts
import NextAuth, { User } from "next-auth";
import type { AdapterUser, AdapterAccount } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const baseAdapter = PrismaAdapter(prisma);

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: {
    ...baseAdapter,

    createUser: async (data: Omit<AdapterUser, "id">) => {
      const { name, ...rest } = data;

      const user = await prisma.user.create({
        data: {
          ...rest,
          user_name: name,
        },
      });

      return {
        id: String(user.id),
        name: user.user_name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      } as AdapterUser;
    },

    linkAccount: async (data: AdapterAccount) => {
      await prisma.account.create({
        data: {
          ...data,
          userId: Number(data.userId),
        },
      });
      return data;
    },
  },
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email as string },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          creds.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: String(user.id),
          user_name: user.user_name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.user_name = (user as User).user_name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as User).user_name = token.user_name;
      }
      return session;
    },
  },
});