import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      id: "user-credentials",
      name: "User",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "USER",
          userType: "user",
        };
      },
    }),
    CredentialsProvider({
      id: "driver-credentials",
      name: "Driver",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const driver = await prisma.driver.findUnique({
          where: { email: credentials.email },
        });
        if (!driver) return null;
        const isValid = await bcrypt.compare(
          credentials.password,
          driver.password,
        );
        if (!isValid) return null;
        return {
          id: driver.id,
          email: driver.email,
          name: driver.name,
          role: "DRIVER",
          userType: "driver",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.userType = (user as any).userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).userType = token.userType;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If driver is logging in, redirect to driver dashboard
      if (url.includes("/driver")) return url;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
};
