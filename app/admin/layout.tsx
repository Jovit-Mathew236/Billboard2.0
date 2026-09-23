import type { Metadata } from "next";
import { AuthProvider } from "@/lib/provider/authProvider";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Dashboard | Billboard", template: "%s | Billboard" },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
