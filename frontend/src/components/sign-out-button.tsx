"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className="rounded-lg bg-brand-bg px-4 py-2 text-sm font-medium text-brand-text-secondary border border-brand-border transition-all duration-200 hover:border-brand-terracotta hover:text-brand-text cursor-pointer"
    >
      Sign out
    </button>
  );
}

