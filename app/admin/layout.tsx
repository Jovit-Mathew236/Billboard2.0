import type { Metadata } from "next";
import HeaderButtons from "@/components/ui/headerButtons"; // Import the new component
import { AuthProvider } from "@/lib/provider/authProvider";

export const metadata: Metadata = {
  title: "Billboard | admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AuthProvider>
        <HeaderButtons />
        <div className="px-6 mt-[0dvh]">{children}</div>
      </AuthProvider>
    </div>
  );
}
