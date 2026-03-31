import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "./context/StoreContext";
import { ClientLayout } from "./components/ClientLayout";

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
      <body>
        <StoreProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
