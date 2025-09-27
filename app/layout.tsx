import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Upwork Engine",
  description: "AI-powered Upwork job intake and triage system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}