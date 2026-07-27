import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import { company } from "@/config/company";
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
  title: company.metadata.title,
  description: company.metadata.description,
  keywords: [...company.metadata.keywords],
  creator: company.name,
  publisher: company.name,
  openGraph: {
    title: company.metadata.title,
    description: company.metadata.description,
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
      <body className="min-h-full flex flex-col">
        {/* Sidebar + main content fill the viewport height */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-y-auto">
            {children}
          </div>
        </div>
        {/* Single footer spanning full width, below both sidebar and content */}
        <Footer />
      </body>
    </html>
  );
}
