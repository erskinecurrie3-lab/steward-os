import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const Providers = dynamic(
  () => import("@/components/providers").then((m) => ({ default: m.Providers })),
  { ssr: true }
);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "StewardOS",
  description: "Guest follow-up and care management for churches",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
