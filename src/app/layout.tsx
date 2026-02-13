// src/app/layout.tsx
import "./globals.css";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { ErrorSuppressor } from "@/components/ErrorSuppressor";

export const metadata: Metadata = {
  title: "ChargeGhar Dashboard",
  description: "Admin dashboard for ChargeGhar EV platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorSuppressor />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}