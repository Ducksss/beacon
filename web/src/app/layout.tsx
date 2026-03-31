import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Beacon | Telegram Outreach Demo",
    template: "%s | Beacon",
  },
  description:
    "Beacon is a polished Telegram outreach demo for campus committees, house systems, and student operations teams.",
  openGraph: {
    title: "Beacon | Telegram Outreach Demo",
    description:
      "A portfolio-ready Telegram outreach product demo with a public playground, operator dashboard, and live poll collation.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beacon | Telegram Outreach Demo",
    description:
      "A portfolio-ready Telegram outreach product demo with a public playground and operator dashboard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
