import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Billboard",
    short_name: "Billboard",
    dir: "ltr",
    lang: "en",
    description: "App for managing real-time billboards",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f0f0f0", // A light gray for a neutral splash screen
    theme_color: "#ff5722", // A vibrant color for the status bar
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/mstile-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    display_override: ["fullscreen", "window-controls-overlay"],
    shortcuts: [
      {
        name: "Add user",
        url: "admin/create",
        description: "Create new user",
        icons: [
          {
            src: "/add-user-icon.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Edit Theme",
        url: "/edit",
        description: "Editing theme",
        icons: [
          {
            src: "/edit-theme-icon.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
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
