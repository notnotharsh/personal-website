import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
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
        className={`${inconsolata.variable} font-mono antialiased bg-white dark:bg-black text-black dark:text-white`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="pt-24 pb-20 px-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
