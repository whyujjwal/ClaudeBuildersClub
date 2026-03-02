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
        className="rounded-lg bg-claude-surface px-4 py-2 text-sm font-medium text-claude-text-muted border border-claude-border transition-all duration-200 hover:border-claude-orange hover:text-claude-text hover:bg-claude-surface-hover cursor-pointer"
      >
        Sign out
      </button>
    </form>
  );
}
