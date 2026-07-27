import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import Script from "next/script";
import { company } from "@/config/company";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
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
      suppressHydrationWarning
    >
      <body className="h-full flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.classList.toggle('dark',t==='dark')})()`,
          }}
        />
        {/* Sidebar + main content fill the viewport height */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <Sidebar />
          <div id="main-content" className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {children}
          </div>
        </div>
        {/* Single footer spanning full width, below both sidebar and content */}
        <Footer />

        {/* Scroll-to-top button */}
        <ScrollToTop />
      </body>
    </html>
  );
}
