import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { FcmHandler } from "@/components/auth/FcmHandler";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Campus Management System",
  description: "Campus Management System for colleges and universities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <FcmHandler />
          {children}
          <Toaster />
         
        </AuthProvider>
      </body>
    </html>
  );
}
