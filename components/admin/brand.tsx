import Link from "next/link";
import { AppIcon } from "@/components/app-icon";

export function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <AppIcon size={32} />
      <span className="text-[15px] font-semibold tracking-tight">Billboard</span>
    </Link>
  );
}
