"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AppIcon } from "@/components/app-icon";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  leaving?: boolean;
  className?: string;
}

const DOTS = 7;

export function SplashScreen({ leaving = false, className }: SplashScreenProps) {
  useEffect(() => {
    const root = document.documentElement;
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (mobile && !leaving) root.dataset.splash = "on";
    else delete root.dataset.splash;
    return () => {
      delete root.dataset.splash;
    };
  }, [leaving]);

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
        unoptimized
        sizes="100vw"
        className="object-cover object-top motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-105 motion-safe:duration-700"
      />
      <div className="pb-safe absolute inset-x-0 bottom-0 flex flex-col items-center pb-16 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
        <p className="text-[28px] font-semibold leading-tight tracking-tight text-[#4b4b4b]">Welcome to</p>
        <p className="splash-gradient-text text-[32px] font-bold leading-tight tracking-tight">Billboard App</p>
        <div className="mt-4 flex items-center gap-2.5" aria-hidden="true">
          {Array.from({ length: DOTS }, (_, i) => (
            <span
              key={i}
              className="splash-dot h-2.5 w-2.5 rounded-full"
              style={{ animationDelay: `${i * 110}ms`, backgroundColor: `color-mix(in srgb, #ff8a73 ${100 - (i * 100) / (DOTS - 1)}%, #a44f9c)` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
