import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/lib/context/notification";
import { AuthProvider } from "@/lib/context/auth";
import { NotificationToast } from "@/components/ui/NotificationToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zenny - AI-Powered Customer Support",
  description: "Reduce support workload by 60% and increase conversion by 10% for online stores doing $10k+/mo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NotificationProvider>
          <AuthProvider>
            {children}
            <NotificationToast />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
