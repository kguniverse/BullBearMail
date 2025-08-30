import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "BullBearMail",
    template: "%s | BullBearMail"
  },
  description: "Stock price monitoring and email notification service",
  keywords: ["stock", "email", "notification", "bull", "bear", "market"],
  authors: [{ name: "BullBearMail Team" }],
  creator: "BullBearMail",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "BullBearMail",
    description: "Stock price monitoring and email notification service",
    siteName: "BullBearMail",
  },
  twitter: {
    card: "summary_large_image",
    title: "BullBearMail",
    description: "Stock price monitoring and email notification service",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
