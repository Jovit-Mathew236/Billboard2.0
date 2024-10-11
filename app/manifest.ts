import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Billboard",
    short_name: "Billboard",
    icons: [
      {
        src: "/android-chrome-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/mstile-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#daf4ff",
    background_color: "#ffffff",
    display: "fullscreen",
    id: "billboardsjcet",
    description: "An app for managing billboards",
    start_url: "https://billboard2.vercel.app",
    dir: "ltr",
    lang: "en",
    orientation: "portrait",
    display_override: ["fullscreen", "window-controls-overlay"],
    shortcuts: [
      {
        name: "Add user",
        url: "/create",
        description: "create new user",
      },
      {
        name: "Edit Theme",
        url: "/edit",
        description: "Editing theme",
      },
    ],
    categories: [
      "business",
      "education",
      "lifestyle",
      "productivity",
      "shopping",
      "social",
      "utilities",
      "weather",
    ],
  };
}
