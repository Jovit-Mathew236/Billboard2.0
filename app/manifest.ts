import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Billboard",
    short_name: "Billboard",
    description: "App for manage realtime billboards",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/mstile-150x150.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/splash.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/splash.png",
        sizes: "430x932",
        type: "image/png",
      },
    ],
  };
}
