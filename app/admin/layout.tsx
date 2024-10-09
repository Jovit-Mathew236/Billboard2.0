import type { Metadata } from "next";
import HeaderButtons from "@/components/ui/headerButtons"; // Import the new component

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
      <HeaderButtons />
      <div className="px-6 mt-10">{children}</div>
    </div>
  );
}
