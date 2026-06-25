import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spinwil Cihuy",
  description: "Aplikasi undian spinwheel untuk apapun.",
  icons: {
    icon: "/img/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
