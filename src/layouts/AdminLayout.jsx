import { useEffect } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdmin } from "@/lib/AdminContext";
import { useRouter } from "@/lib/router";

export function AdminLayout({ children }) {
  const { isAdmin } = useAdmin();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!isAdmin) navigate({ to: "/login", replace: true });
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
