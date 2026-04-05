import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "AdmitGH — Ghanaian University Admissions Navigator",
  description:
    "Enter your WASSCE grades and instantly discover which Ghanaian universities and programs you qualify for. AI-powered career guidance included.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable}`}
    >
      <body className="font-sans bg-[#0f0d0b] text-[#faf5ef] min-h-screen">
        {children}
      </body>
    </html>
  );
}
