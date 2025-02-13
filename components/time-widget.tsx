"use client";
import { useEffect, useState } from "react";

interface TimeWidgetProps {
  format?: "12h" | "24h";
  showSeconds?: boolean;
  className?: string;
}

export default function TimeWidget({
  format = "24h",
  showSeconds = true,
  className,
}: TimeWidgetProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let timeString = "";

      if (format === "12h") {
        timeString = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: showSeconds ? "2-digit" : undefined,
          hour12: true,
        });
      } else {
        timeString = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: showSeconds ? "2-digit" : undefined,
          hour12: false,
        });
      }

      setTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [format, showSeconds]);

  return <div className={className}>{time}</div>;
}
