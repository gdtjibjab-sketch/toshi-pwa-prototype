import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toshi.bet App Prototype",
  description: "Installable PWA prototype for Toshi.bet",
  manifest: "/manifest.webmanifest",
  themeColor: "#0b0b0f",
  appleWebApp: {
    capable: true,
    title: "Toshi",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}