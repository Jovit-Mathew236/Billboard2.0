export const DISPLAY_REGIONS = ["weather", "branding", "staff", "faculty", "gallery", "batches", "news"] as const;

export type DisplayRegion = (typeof DISPLAY_REGIONS)[number];

export const REGION_LABELS: Record<DisplayRegion, string> = {
  weather: "Weather & time",
  branding: "Branding",
  staff: "Staff counts",
  faculty: "Faculty",
  gallery: "Photo carousel",
  batches: "Batch highlights",
  news: "News ticker",
};

export const EDITOR_MESSAGE = {
  select: "billboard:select",
  highlight: "billboard:highlight",
} as const;

export const isDisplayRegion = (value: unknown): value is DisplayRegion =>
  typeof value === "string" && (DISPLAY_REGIONS as readonly string[]).includes(value);
