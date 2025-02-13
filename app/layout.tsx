import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });
// const calSans = localFont({
//   src: "./fonts/CalSans-SemiBold.woff",
//   variable: "--font-cal-sans",
//   weight: "100 900",
// });
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
  description: "App for manage realtime billboards",
  manifest: "/site.webmanifest",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Billboard",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />

        <link rel="apple-touch-startup-image" href="/splash.png" />
        {/* Add multiple splash screen images for different iOS device sizes */}
        <link
          rel="apple-touch-startup-image"
          href="/splash-640x1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash-1242x2208.png"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash-1536x2048.png"
          media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash-1668x2224.png"
          media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash-2048x2732.png"
          media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2)"
        />
        {/* manifest */}
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${sfUiDisplay.className} `}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
