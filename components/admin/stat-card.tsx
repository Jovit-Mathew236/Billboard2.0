import Link from "next/link";
import { ArrowUpRight, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href: string;
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, href, loading }: StatCardProps) {
  return (
    <Link href={href} className="group transition-transform active:scale-[0.98]">
      <Card className="flex h-full flex-col gap-3 p-4 transition-colors [--outer-padding:1rem] group-hover:border-primary/40 sm:p-5 sm:[--outer-padding:1.25rem]">
        <div className="flex items-center justify-between">
          <span className="rounded-inner flex h-9 w-9 items-center justify-center bg-accent text-accent-foreground">
            <Icon className="h-4 w-4" />
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary" />
        </div>
        <div>
          {loading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-semibold tabular-nums sm:text-3xl">{value}</p>}
          <p className="mt-0.5 text-xs font-medium leading-tight text-muted-foreground sm:text-sm">{label}</p>
        </div>
      </Card>
    </Link>
  );
}
