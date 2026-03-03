import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-brand-surface p-10 shadow-[0_2px_40px_-8px_rgba(0,0,0,0.08)] border border-brand-border">
        {/* Logo / Branding */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-20 w-20 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/thinking.jpg"
              alt="Claude Builders Club"
              className="h-20 w-20 rounded-xl object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-text">
            Claude Builders Club
          </h1>
          <p className="text-brand-text-muted text-sm">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-brand-border" />

        {/* Google Sign-In */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-3 rounded-xl bg-brand-surface px-5 py-4 text-brand-text font-medium border border-brand-border transition-all duration-200 hover:border-brand-terracotta hover:shadow-md cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Sign in with BITS email</span>
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-brand-text-muted">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
