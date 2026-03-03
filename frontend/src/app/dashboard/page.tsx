import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/api-client";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch full user profile (includes onboarding_completed)
  let userData = null;
  try {
    const res = await backendFetch("/users/me");
    if (res.ok) {
      userData = await res.json();
    }
  } catch {
    // If fetch fails, fall through with null — will show onboarding
  }

  return (
    <DashboardClient
      user={
        userData ?? {
          uid: "",
          name: session.user.name ?? "",
          email: session.user.email ?? "",
          picture: session.user.image ?? "",
          onboarding_completed: false,
          track: null,
          path: null,
          interests: [],
        }
      }
    />
  );
}

