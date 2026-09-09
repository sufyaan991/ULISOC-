import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leicester ISoc | Prayer times & student discounts",
  description: "Prayer and Jumu'ah information, Leicester student discounts and contact details for Leicester Islamic Society.",
  manifest: "/manifest.webmanifest",
  applicationName: "ULISOC Membership",
  appleWebApp: {
    capable: true,
    title: "ULISOC Membership",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/ulisoc-favicon.png",
    shortcut: "/ulisoc-favicon.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
