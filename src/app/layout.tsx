import type { Metadata } from "next";
// Self-hosted fonts (Fontsource) — previously next/font/google, which made
// every production build depend on reaching fonts.googleapis.com and failed
// the build outright when Google Fonts was unreachable. The matching CSS
// variables (--font-inter / --font-poppins / --font-playfair) are defined in
// globals.css.
import "@fontsource-variable/inter";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource-variable/playfair-display";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "CampusCred - Earn Real Work. Gain Real Cred.",
  description:
    "India's most trusted student career ecosystem. Complete real-world tasks, earn verified digital certificates, apply for micro-internships, build a public portfolio, and get hired — all 100% free for students.",
  keywords: [
    "CampusCred",
    "internship",
    "certificates",
    "college students",
    "India",
    "micro-internships",
    "verified certificates",
    "QR code certificates",
    "student portfolio",
    "career ecosystem",
  ],
  icons: {
    icon: "/logo.svg",
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
        className="font-sans antialiased bg-background text-foreground"
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
