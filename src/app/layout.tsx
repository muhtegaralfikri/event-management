import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/shared/site-footer";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EventTix",
  description: "Platform event management dan tiket digital.",
  icons: {
    icon: "/eventtix-icon.png",
    shortcut: "/eventtix-icon.png",
    apple: "/eventtix-icon.png",
  },
};

import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SessionProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
          <SiteFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
