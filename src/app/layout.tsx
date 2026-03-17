import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Youth For Christ - Money Request System",
  description:
    "NGO Management System for Youth For Christ Kenya - Efficient requisition and expense tracking",
  keywords: [
    "Youth For Christ",
    "NGO",
    "Money Request",
    "Requisition System",
    "Kenya",
  ],
  authors: [{ name: "Youth For Christ Kenya" }],
  openGraph: {
    title: "Youth For Christ - Money Request System",
    description:
      "Efficient requisition and expense tracking for Youth For Christ Kenya",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Youth For Christ - Money Request System",
    description:
      "Efficient requisition and expense tracking for Youth For Christ Kenya",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
