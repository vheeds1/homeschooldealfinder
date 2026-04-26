import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              displayName: true,
              avatarUrl: true,
              passwordHash: true,
              role: true,
              isPremium: true,
            },
          });

          if (!user || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
            image: user.avatarUrl,
          };
        } catch (err) {
          console.error("Auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email! },
            select: { id: true, role: true, isPremium: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.isPremium = dbUser.isPremium;
          }
        } catch {
          token.id = user.id!;
          token.role = "USER";
          token.isPremium = false;
        }
      }
      return token;
    },
  },
});
