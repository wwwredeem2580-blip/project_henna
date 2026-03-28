import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ria's Henna Artistry",
  description: "Professional mehendi artistry for your most cherished moments. Bespoke henna designs for weddings, engagements, and celebrations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
