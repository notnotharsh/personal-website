import type { Metadata } from "next";
import { Raleway, Noto_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";
import "katex/dist/katex.min.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-raleway",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Harsh Tiwary",
  description: "Software Engineer — Personal Website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${raleway.variable} ${notoSans.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <ThemeToggle />
          <main className="max-w-[56rem] mx-auto mt-28 md:mt-32 px-6 pb-16">
            {children}
          </main>
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
