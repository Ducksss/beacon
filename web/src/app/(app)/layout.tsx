import Link from "next/link";
import { isPublicDemoMode } from "@/lib/public-demo";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicDemoMode = isPublicDemoMode();

  return (
    <div className="app-shell-glow min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#090909]/78 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.5rem] max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/8 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <span className="font-display text-sm font-semibold tracking-[0.22em] text-[#ffbf6b]">
                B
              </span>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[0.02em] text-white">Beacon</p>
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-white/42">
                Portfolio Release
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {publicDemoMode && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ffbf6b]/20 bg-[#ffbf6b]/8 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#ffe0b6]">
                <span className="size-1.5 rounded-full bg-[#ffbf6b]" />
                Read-only public demo
              </div>
            )}
            <nav className="flex items-center gap-2 text-sm font-medium text-white/58">
              <Link
                href="/dashboard"
                className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/6 hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/try"
                className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/6 hover:text-white"
              >
                Try Online
              </Link>
              <Link
                href="/"
                className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/6 hover:text-white"
              >
                Product Story
              </Link>
              {!publicDemoMode && (
                <Link
                  href="/compose"
                  className="rounded-full border border-white/12 bg-white/8 px-4 py-1.5 text-white transition-colors hover:bg-white/12"
                >
                  New Broadcast
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto flex-1 max-w-6xl px-4 py-8 sm:py-10">
        <div className="soft-panel rounded-[1.75rem] border border-white/8 p-5 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
