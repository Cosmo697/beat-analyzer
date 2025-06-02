import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beat Map Dashboard",
  description: "Analyze audio locally and store groove patterns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
