import type { Metadata } from "next";
import { Quicksand, Syne } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "jadwal.ai — Asisten Jadwal AI",
  description: "Ngobrol sama jadwal kamu. Asisten jadwal AI yang berpikir bareng kamu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${quicksand.variable} ${syne.variable} font-sans antialiased h-screen w-full overflow-hidden`}
      >
        <div className="w-full h-full flex flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
