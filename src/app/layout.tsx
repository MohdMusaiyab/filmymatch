import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/general/Footer";
import { Header } from "./components/general/Header";
import SessionProviderWrapper from "./providers/SessionProviderWrapper";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snippit",
  description:
    "Your personal space for collecting and sharing highlights from your favorite content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <SessionProviderWrapper>
          <div className="flex flex-col h-screen overflow-hidden">
            <main className="flex-1 overflow-y-auto hide-scrollbar">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="top-center" richColors />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
