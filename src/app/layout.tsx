import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ImpactIQ Mail Analyzer",
  description:
    "Analiza tus correos de Gmail con inteligencia artificial. Resúmenes, prioridades e insights en un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${inter.variable}`}>
      <body className={`${inter.className} min-h-screen bg-gray-950 antialiased`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
