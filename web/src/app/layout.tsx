import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beacon | CSC Dashboard",
  description: "Centralized Telegram bot outreach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <header className="border-b border-border bg-card sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
           <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
              <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
                 <div className="size-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <span className="text-primary-foreground text-xs font-black">B</span>
                 </div>
                 Beacon
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                 <Link href="/" className="hover:text-foreground transition-colors">Dashboard</Link>
                 <Link href="/compose" className="hover:text-foreground transition-colors bg-secondary px-3 py-1.5 rounded-md hover:bg-secondary/80 text-secondary-foreground">New Broadcast</Link>
              </nav>
           </div>
        </header>
        <main className="flex-1 container mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
