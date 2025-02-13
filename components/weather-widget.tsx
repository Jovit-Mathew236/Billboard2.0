"use client";

interface WeatherWidgetProps {
  location?: string;
  unit: "celsius" | "fahrenheit";
}

const WeatherWidget = ({ location = "", unit }: WeatherWidgetProps) => {
  // TODO: Implement weather API integration
  return (
    <div className="flex flex-col items-center">
      <div>{location}</div>
      <div>25°{unit === "celsius" ? "C" : "F"}</div>
    </div>
  );
};

export default WeatherWidget;
