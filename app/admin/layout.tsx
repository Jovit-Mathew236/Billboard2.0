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
      <div className=" top-5 right-3 flex gap-2 justify-end px-6 py-4">
        <Button
          variant={"primary"}
          className="rounded-full p-0 w-[50px] h-[50px]"
        >
          <Settings color="#4C4C4C" size={20} />
        </Button>
        <Button
          variant={"primary"}
          className="rounded-full p-0 w-[50px] h-[50px]"
        >
          <BellDot color="#4C4C4C" size={20} />
        </Button>
        <Button
          variant={"primary"}
          className="rounded-full p-0 w-[50px] h-[50px]"
        ></Button>
      </div>
      <div className="px-6 mt-10 ">{children}</div>
    </div>
  );
}
