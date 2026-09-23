import Link from "next/link";

export function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black tracking-tighter text-white shadow-sm">
        B
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Billboard</span>
    </Link>
  );
}
