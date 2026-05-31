import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Логин" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        // check user, verify password
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
})