import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { KeyboardInset } from "@/components/keyboard-inset";
import { ThemeColorSync } from "@/components/theme-color-sync";

const sfUiDisplay = localFont({
  src: [
    {
      path: "./fonts/SF UI/sf-ui-display-thin.otf",
      weight: "100",
      style: "thin",
    },
    {
      path: "./fonts/SF UI/sf-ui-display-ultralight.otf",
      weight: "200",
      style: "extralight",
    },
    {
      path: "./fonts/SF UI/sf-ui-display-light.otf",
      weight: "300",
      style: "light",
    },
    {
      path: "./fonts/SF UI/sf-ui-display-medium.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SF UI/sf-ui-display-medium.otf",
      weight: "500",
      style: "medium",
    },
    {
      path: "./fonts/SF UI/sf-ui-display-semibold.otf",
      weight: "600",
      style: "semibold",
    },
    {
      path: "./fonts/SF UI/sf-ui-display-bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "./fonts/SF UI/sf-ui-display-heavy.otf",
      weight: "800",
      style: "extrabold",
    },
    {
      path: "./fonts/SF UI/sf-ui-display-black.otf",
      weight: "900",
      style: "black",
    },
  ],
});

export const metadata: Metadata = {
  title: "Billboard",
  description: "Manage real-time department billboards",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    startupImage: ["/splash.png"],
    title: "Billboard",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={sfUiDisplay.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
        <KeyboardInset />
        <ThemeColorSync />
      </body>
    </html>
  );
}
