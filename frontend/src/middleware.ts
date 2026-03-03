import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  const isOnAdmin = req.nextUrl.pathname.startsWith("/dashboard/admin")
  const isOnLogin = req.nextUrl.pathname === "/login"

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl.origin))
  }

  if (isOnLogin && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin))
  }

  if (isOnAdmin && req.auth?.role !== "admin") {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
