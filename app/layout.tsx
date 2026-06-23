import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpinWheel Seminar",
  description: "Aplikasi undian spinwheel untuk seminar dan event."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
