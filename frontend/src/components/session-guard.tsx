"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

/** Watches session for token expiry and auto-signs out. Renders nothing. */
export function SessionGuard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.error === "AccessTokenExpired") {
      void signOut({ redirect: false }).then(() => {
        window.location.replace("/login");
      });
    }
  }, [session, status]);

  return null;
}
