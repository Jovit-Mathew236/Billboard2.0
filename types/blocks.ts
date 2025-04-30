export interface ContentBlock {
  id: string;
  type:
    | "text"
    | "image"
    | "weather"
    | "time"
    | "faculty"
    | "staff"
    | "news"
    | "marquee"
    | "list"
    | "table"
    | "carousel";
  title: string;
  width: number;
  height: number;
  position?: number;
  theme: "light" | "dark" | "system";
  backgroundColor?: string;
  textColor?: string;
}

export interface TextField extends ContentBlock {
  type: "text";
  content: string;
  textAlign?: "left" | "center" | "right";
}

export interface ImageField extends ContentBlock {
  type: "image";
  imageUrl: string;
  alt?: string;
}

export interface WeatherField extends ContentBlock {
  type: "weather";
  location?: string;
  unit: "celsius" | "fahrenheit";
}

export interface TimeField extends ContentBlock {
  type: "time";
  format: "12h" | "24h";
  showSeconds?: boolean;
}

export interface StaffField extends ContentBlock {
  type: "staff";
  positions: Array<{
    position: string;
    count: string;
  }>;
}

export interface NewsField extends ContentBlock {
  type: "news";
  showNifty?: boolean;
  showWeather?: boolean;
}

export interface MarqueeField extends ContentBlock {
  type: "marquee";
  content: string[];
}

export interface ListField extends ContentBlock {
  type: "list";
  items: string[];
  listStyle?: "bullet" | "number" | "none";
}

export interface TableField extends ContentBlock {
  type: "table";
  headers: string[];
  rows: string; // JSON stringified array of string arrays
}

export interface CarouselField extends ContentBlock {
  type: "carousel";
  transitionInterval?: number; // in milliseconds, defaults to 5000 (5 seconds)
}
