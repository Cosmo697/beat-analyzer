import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beat Fingerprint Dashboard",
  description:
    "Analyze audio tracks to extract beat patterns and create groove fingerprints without uploading your audio files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
