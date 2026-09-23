"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ASPECT = 16 / 9;

interface LivePreviewProps {
  className?: string;
  interactive?: boolean;
}

export const LivePreview = forwardRef<HTMLIFrameElement, LivePreviewProps>(({ className, interactive = false }, ref) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);


  return (
    <div
      ref={frameRef}
      className={cn("relative w-full overflow-hidden rounded-xl bg-[#1c1640] shadow-inner ring-1 ring-border", className)}
      style={{ aspectRatio: "9 / 16" }}
    >
      {!loaded && <div className="brand-gradient absolute inset-0 animate-pulse" />}
      {width > 0 && (
        <iframe
          ref={ref}
          src={interactive ? "/display?mode=edit" : "/display"}
          title={interactive ? "Display editor" : "Live display preview"}
          tabIndex={interactive ? 0 : -1}
          onLoad={() => setLoaded(true)}
          className={cn("absolute left-0 top-0 border-0", !interactive && "pointer-events-none")}
          style={{
            width: Math.round(width * ASPECT),
            height: Math.round(width),
            transformOrigin: "top left",
            transform: `translateX(${width}px) rotate(90deg)`,
          }}
        />
      )}
    </div>
  );
});
LivePreview.displayName = "LivePreview";
