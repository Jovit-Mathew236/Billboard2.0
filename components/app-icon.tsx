import Image from "next/image";
import { cn } from "@/lib/utils";

export function AppIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/android-chrome-192x192.png"
      alt="Billboard"
      width={size}
      height={size}
      priority
      className={cn("shrink-0 rounded-[22%] shadow-sm", className)}
    />
  );
}
