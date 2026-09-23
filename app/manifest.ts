import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/admin",
    name: "Billboard",
    short_name: "Billboard",
    dir: "ltr",
    lang: "en",
    description: "App for managing real-time billboards",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8f8fc",
    theme_color: "#5b3ec8",
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
        purpose: "any",
      },
    ],
    display_override: ["standalone", "minimal-ui"],
    shortcuts: [
      {
        name: "Users",
        url: "/admin/users",
        description: "Manage who can sign in",
        icons: [
          {
            src: "/add-user-icon.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Edit display",
        url: "/admin/edit",
        description: "Visually edit the billboard",
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
