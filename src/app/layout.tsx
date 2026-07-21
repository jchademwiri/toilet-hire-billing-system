import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HS02 Billing System | Chemical Toilet Hire Management",
  description:
    "Streamlined billing and operations system for chemical toilet hire services under contract HS 02-2025/26 with the City of Tshwane. Automated invoice generation, service tracking, and Sage integration.",
  keywords: [
    "toilet hire",
    "billing system",
    "chemical toilets",
    "City of Tshwane",
    "invoice management",
    "service tracking",
  ],
  creator: "Sithembe Transportation and Projects",
  publisher: "Sithembe Transportation and Projects",
  openGraph: {
    title: "HS02 Billing System | Chemical Toilet Hire Management",
    description:
      "Streamlined billing and operations system for chemical toilet hire services.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-0">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
