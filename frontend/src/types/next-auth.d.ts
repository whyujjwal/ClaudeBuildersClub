import "next-auth"
import "next-auth/jwt"

export type UserRole = "admin" | "project_manager" | "user"

declare module "next-auth" {
  interface Session {
    idToken?: string
    role?: UserRole
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string
    accessToken?: string
    accessTokenExpires?: number
    role?: UserRole
    error?: string
  }
}
