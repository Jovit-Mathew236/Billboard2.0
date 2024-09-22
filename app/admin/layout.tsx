import { Button } from "@/components/ui/button";
import { BellDot, Settings } from "lucide-react";
import type { Metadata } from "next";
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
      <div className="absolute top-5 right-3 flex gap-2">
        <Button className="rounded-full w-[40px] h-[40px] bg-white">
          <Settings color="#4C4C4C" size={20} />
        </Button>
        <Button className="rounded-full w-[40px] h-[40px] bg-white">
          <BellDot color="#4C4C4C" size={20} />
        </Button>
        <Button className="rounded-full w-[40px] h-[40px] bg-white"></Button>
      </div>
      {children}
    </div>
  );
}
