import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { UserRole } from "@/types/next-auth"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token
        token.accessToken = account.access_token

        // Fetch role from backend on sign-in
        try {
          const res = await fetch(`${BACKEND_URL}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${account.id_token}`,
            },
          })
          if (res.ok) {
            const data = await res.json()
            token.role = data.role as UserRole
          }
        } catch (error) {
          console.error("Failed to fetch user role from backend:", error)
          token.role = "user"
        }
      }
      return token
    },
    async session({ session, token }) {
      session.idToken = token.idToken as string
      session.role = token.role as UserRole
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days — persists across browser closes
  },
  pages: {
    signIn: "/login",
  },
})
