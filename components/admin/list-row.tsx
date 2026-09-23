import { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ListRowProps {
  handle?: ReactNode;
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ListRow({ handle, leading, title, subtitle, trailing, onEdit, onDelete, className }: ListRowProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2 rounded-xl border bg-card p-2 pr-2 sm:pr-3 shadow-sm transition-shadow motion-safe:duration-300 motion-safe:animate-in motion-safe:fade-in sm:gap-3", className)}>
      {handle}
      {leading}
      <div className="min-w-0 flex-1 py-1">
        <div className="line-clamp-2 break-words font-medium leading-snug">{title}</div>
        {subtitle && <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>}
      </div>
      {trailing}
      <div className="flex shrink-0 items-center">
        {onEdit && (
          <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit">
            <Pencil />
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label="Delete" className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <Trash2 />
          </Button>
        )}
      </div>
    </div>
  );
}
