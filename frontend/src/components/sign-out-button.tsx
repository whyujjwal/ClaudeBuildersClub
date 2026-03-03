import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="rounded-lg bg-brand-bg px-4 py-2 text-sm font-medium text-brand-text-secondary border border-brand-border transition-all duration-200 hover:border-brand-terracotta hover:text-brand-text cursor-pointer"
      >
        Sign out
      </button>
    </form>
  );
}
