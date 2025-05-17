"use client";
import { useEffect, useState } from "react";

interface TimeWidgetProps {
  format?: "12h" | "24h";
  showSeconds?: boolean;
  className?: string;
}

export default function TimeWidget({
  format = "12h",
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
          // second: showSeconds ? "2-digit" : undefined,
          hour12: true,
        });
        // Ensure AM/PM is displayed properly
        if (!timeString.includes("AM") && !timeString.includes("PM")) {
          const period = now.getHours() >= 12 ? "PM" : "AM";
          timeString = `${timeString} ${period}`;
        }
      } else {
        timeString = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          // second: showSeconds ? "2-digit" : undefined,
          hour12: false,
        });
      }

      setTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [format, showSeconds]);

  // For 12-hour format, split the time and AM/PM for better styling
  if (format === "12h") {
    const timeParts = time.split(/(AM|PM)/);
    const timeValue = timeParts[0].trim();
    const period = timeParts[1] || "";

    return (
      <div className={className}>
        <span>{timeValue}</span>
        {period && <span className="ml-10 font-bold align-top">{period}</span>}
      </div>
    );
  }

  return <div className={className}>{time}</div>;
}
