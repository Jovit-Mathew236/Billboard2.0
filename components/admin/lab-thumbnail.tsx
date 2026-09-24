/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

interface LabThumbnailProps {
  src?: string | null;
  code: string;
  name: string;
  className?: string;
}

export const labMonogram = (code: string, name: string) =>
  (code.split(/[\s-]+/)[0] || name.split(/\s+/).map((w) => w[0]).join("")).slice(0, 4).toUpperCase();

export function LabThumbnail({ src, code, name, className }: LabThumbnailProps) {
  return (
    <span className={cn("rounded-inner relative flex aspect-[16/11] shrink-0 items-center justify-center overflow-hidden", className)}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="brand-gradient flex h-full w-full items-center justify-center text-sm font-bold tracking-tight text-white">
          {labMonogram(code, name)}
        </span>
      )}
    </span>
  );
}
