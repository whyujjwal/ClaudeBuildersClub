import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
