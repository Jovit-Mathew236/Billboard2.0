import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Billboard",
    short_name: "Billboard",
    description: "App for managing real-time billboards",
    scope: "/",
    start_url: "/",
    display: "minimal-ui",
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
  };
}
