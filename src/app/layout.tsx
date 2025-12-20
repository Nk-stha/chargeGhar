// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
// import { SpeedInsights } from "@vercel/speed-insights/next";
// import { Analytics } from "@vercel/analytics/next";
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
        {children}
        {/* <Analytics /> */}
        {/* <SpeedInsights /> */}
      </body>
    </html>
  );
}