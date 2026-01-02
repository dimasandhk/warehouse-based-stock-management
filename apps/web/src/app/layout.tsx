import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../index.css";
import { Sidebar } from "@/components/sidebar";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockManager",
  description: "Warehouse Based Stock Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}>
        <Providers>
          <div className="flex h-screen w-full bg-muted/20 text-foreground">
             <Sidebar />
             <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl flex items-center px-6 justify-between md:hidden z-40 shrink-0">
                    <span className="font-bold">StockManager</span>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        {children}
                    </div>
                </main>
             </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
