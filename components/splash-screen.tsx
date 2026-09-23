import Image from "next/image";
import { AppIcon } from "@/components/app-icon";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  leaving?: boolean;
  className?: string;
}

export function SplashScreen({ leaving = false, className }: SplashScreenProps) {
  return (
    <>
      <MobileSplash leaving={leaving} className={className} />
      {!leaving && (
        <div className="fixed inset-0 z-[200] hidden items-center justify-center bg-background lg:flex">
          <AppIcon size={56} className="motion-safe:animate-pulse" />
        </div>
      )}
    </>
  );
}

function MobileSplash({ leaving, className }: SplashScreenProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading Billboard"
      className={cn(
        "fixed inset-0 z-[200] overflow-hidden bg-[#f1f1f1] transition-opacity duration-500 lg:hidden",
        leaving ? "pointer-events-none opacity-0" : "opacity-100",
        className
      )}
    >
      <Image
        src="/splash-art.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        unoptimized
        className="object-cover object-top motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-105 motion-safe:duration-700"
      />
      <div className="pb-safe absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 pb-16 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
        <Image src="/splash-text.webp" alt="Welcome to Billboard App" width={205} height={101} priority unoptimized className="h-auto w-44" />
      </div>
    </div>
  );
}
