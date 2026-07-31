import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./Share/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://invoice-app-bd.vercel.app"),
  title: {
    default: "QuickBill - Free Online Invoice Generator",
    template: "%s | QuickBill",
  },
  description:
    " Free online invoice generator for freelancers and small businesses in Bangladesh.",
  keywords: [
    "invoice",
    "invoice generator",
    "invoice app",
    "Bangladesh invoice",
    "free invoice maker",
    "online invoice bangladesh",
    "quickbill",
  ],
  icons: {
    icon: "/invoice.svg",
  },
  openGraph: {
    title: "QuickBill - Free Online Invoice Generator",
    description: "Free Online Invoice Generator in Bangladesh",
    url: "https://invoice-app-bd.vercel.app",
    siteName: "QuickBill",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QuickBill",
      },
    ],
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickBill",
    description: "Free Online Invoice Generator in Bangladesh",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://invoice-app-bd.vercel.app",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar></Navbar>
          <Toaster position="top-center" />
          {children}</Providers>

      </body>
    </html>
  );
}
