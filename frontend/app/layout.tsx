import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ variable: "--inter" });

const NotoSansArabic = Noto_Sans_Arabic({ variable: "--noto-sans-arabic" });

export const metadata: Metadata = {
  title: "movie rating app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        NotoSansArabic.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <Toaster position="top-center" theme="dark"  />
        </ThemeProvider>
      </body>
    </html>
  );
}
