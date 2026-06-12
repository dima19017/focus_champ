import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as any).id = token.id as string
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Логин" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials as { username: string; password: string }
        if (!username || !password) return null
        const user = await prisma.user.findUnique({ where: { username } })
        if (!user) return null
        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, name: user.displayName || user.username, email: `${user.username}@focus-champ.local` }
      },
    }),
  ],
  pages: { signIn: "/login" },
})
