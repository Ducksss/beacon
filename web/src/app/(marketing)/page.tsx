import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LandingInteractiveSections } from "@/components/landing-interactive-sections";
import { isPublicDemoMode } from "@/lib/public-demo";
import { isSupabaseConfigured } from "@/lib/supabase";

const defaultReleaseHighlights = [
  {
    label: "Public Playground",
    value: "Try live sends with your own Telegram bot token, without touching the shared Beacon data layer.",
  },
  {
    label: "Operator Surface",
    value: "Show the real compose, category, and dashboard workflow in demos, recordings, and portfolio walkthroughs.",
  },
  {
    label: "System Story",
    value: "A clear end-to-end product narrative: broadcast, distribute, collate responses, then refine the next message.",
  },
];

const defaultDemoSignals = [
  "Telegram-native sending flow",
  "Safe public trial route",
  "Live dashboard and poll collation",
];

export default function LandingPage() {
  const appIsConfigured =
    isSupabaseConfigured() && Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
  const publicDemoMode = isPublicDemoMode();

  if (appIsConfigured && !publicDemoMode) {
    redirect("/dashboard");
  }

  const releaseHighlights = publicDemoMode
    ? [
        {
          label: "Public Playground",
          value: "Try live sends with your own Telegram bot token, without touching the shared Beacon data layer.",
        },
        {
          label: "Read-Only Dashboard",
          value: "Show a curated Supabase-backed dashboard publicly without exposing compose, category management, or inline editing controls.",
        },
        {
          label: "System Story",
          value: "A clear end-to-end product narrative: broadcast, distribute, collate responses, then review the outcome in a calm shared demo view.",
        },
      ]
    : defaultReleaseHighlights;
  const demoSignals = publicDemoMode
    ? [
        "Telegram-native sending flow",
        "Safe public trial route",
        "Read-only shared dashboard",
      ]
    : defaultDemoSignals;

  return (
    <div className="relative overflow-hidden bg-[#090909] text-[#f7f2e8]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_top,_rgba(255,189,89,0.22),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,0.04),_transparent_36%)]" />
        <div className="absolute left-0 top-28 h-96 w-96 rounded-full bg-[#ffb452]/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-80 h-[28rem] w-[28rem] rounded-full bg-[#c86f2f]/10 blur-3xl" />
        <div className="landing-grid absolute inset-0 opacity-25" />
      </div>

      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
              <span className="font-display text-lg font-semibold tracking-[0.2em] text-[#ffbf6b]">
                B
              </span>
            </div>
            <div>
              <p className="font-display text-2xl leading-none tracking-[0.08em]">
                Beacon
              </p>
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#f7f2e8]/55">
                Campus Comms System
              </p>
            </div>
          </Link>
            <div className="flex items-center gap-3">
              <a
                href="#proof"
                className="hidden text-sm text-[#f7f2e8]/72 transition-colors hover:text-[#f7f2e8] sm:inline-flex"
              >
                Product
              </a>
              <Link
                href="/try"
                className="inline-flex items-center rounded-full border border-[#f7f2e8]/16 bg-white/8 px-4 py-2 text-sm text-[#f7f2e8] backdrop-blur transition-all hover:border-[#ffbf6b]/45 hover:bg-white/12"
              >
                Try online
              </Link>
            </div>
          </div>
      </header>

      <main>
        <section className="relative flex min-h-screen items-center pt-28">
          <div className="mx-auto grid w-full max-w-7xl gap-14 px-5 pb-14 sm:px-8 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:px-10 lg:pb-20">
            <div className="relative z-10 flex flex-col justify-center">
              <p className="reveal-up text-[0.72rem] uppercase tracking-[0.4em] text-[#ffbf6b]/80">
                Portfolio release. Live Telegram workflow. Campus operations.
              </p>
              <h1 className="font-display reveal-up mt-6 max-w-xl text-6xl leading-[0.92] tracking-[-0.04em] text-[#f7f2e8] [animation-delay:120ms] sm:text-7xl lg:text-[5.8rem]">
                One message.
                <br />
                Every house chat.
                <br />
                No chaos.
              </h1>
              <p className="reveal-up mt-6 max-w-md text-base leading-7 text-[#f7f2e8]/72 [animation-delay:240ms] sm:text-lg">
                Beacon is a polished product demo for committees that need a calm
                command centre for announcements, interest checks, and live
                Telegram outreach across halls, houses, and student communities.
                {publicDemoMode
                  ? " This public deployment keeps the dashboard read-only while still letting visitors test live sends in the playground."
                  : ""}
              </p>
              <div className="reveal-up mt-10 flex flex-col gap-3 sm:flex-row [animation-delay:360ms]">
                <Link
                  href="/try"
                  className="inline-flex items-center justify-center rounded-full bg-[#ffbf6b] px-6 py-3 text-sm font-semibold text-[#1c140b] transition-all hover:-translate-y-0.5 hover:bg-[#ffd28d]"
                >
                  Try online with your bot
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-[#f7f2e8]/18 px-6 py-3 text-sm font-medium text-[#f7f2e8] transition-all hover:border-[#f7f2e8]/40 hover:bg-white/6"
                >
                  {publicDemoMode ? 'Open the shared demo dashboard' : 'Open the operator dashboard'}
                </Link>
              </div>
              <div className="reveal-up mt-10 flex flex-wrap gap-2 [animation-delay:420ms]">
                {demoSignals.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.72rem] uppercase tracking-[0.22em] text-[#f7f2e8]/70"
                  >
                    {signal}
                  </span>
                ))}
              </div>
              <div className="reveal-up mt-12 max-w-md border-t border-[#f7f2e8]/12 pt-5 text-sm leading-6 text-[#f7f2e8]/58 [animation-delay:480ms]">
                Built for CSCs, house systems, orientation teams, and campus
                operators who need message consistency without flattening local
                reach and packaged for public demos without exposing internal
                data or live admin controls.
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative h-[30rem] w-full max-w-[42rem] sm:h-[38rem] lg:h-[44rem]">
                <div className="reveal-scale absolute inset-x-[6%] top-[8%] h-[66%] overflow-hidden rounded-[2rem] border border-white/12 bg-[#131313] shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
                  <Image
                    src="/beacon/dashboard.png"
                    alt="Beacon dashboard showcase"
                    fill
                    priority
                    sizes="(min-width: 1024px) 40rem, 90vw"
                    className="object-cover object-left-top"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,9,0)_0%,rgba(9,9,9,0.18)_100%)]" />
                </div>
                <div className="reveal-scale absolute left-0 top-[56%] h-[30%] w-[48%] overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#111111] shadow-[0_24px_80px_rgba(0,0,0,0.4)] [animation-delay:180ms]">
                  <Image
                    src="/beacon/try.png"
                    alt="Beacon public playground"
                    fill
                    sizes="(min-width: 1024px) 18rem, 44vw"
                    className="object-cover object-left-top"
                  />
                </div>
                <div className="reveal-scale absolute bottom-[2%] right-[3%] h-[24%] w-[44%] overflow-hidden rounded-[1.5rem] border border-[#ffbf6b]/18 bg-[#0f0f0f] shadow-[0_24px_80px_rgba(0,0,0,0.35)] [animation-delay:300ms]">
                  <Image
                    src="/beacon/compose.png"
                    alt="Beacon compose workflow"
                    fill
                    sizes="(min-width: 1024px) 16rem, 40vw"
                    className="object-cover object-left-top"
                  />
                </div>
                <div className="absolute inset-x-[12%] bottom-0 h-24 rounded-full bg-[#ffbf6b]/10 blur-3xl" />
              </div>
            </div>
          </div>
        </section>

        <section className="section-divider relative border-t border-white/8 bg-[#0b0b0b]/92 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:px-10">
            <div className="max-w-lg">
              <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#ffbf6b]/78">
                Demo Ready
              </p>
              <h2 className="font-display mt-5 text-4xl leading-tight tracking-[-0.04em] text-[#f7f2e8] sm:text-5xl">
                A public-facing story around a real operator workflow.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#f7f2e8]/66">
                {publicDemoMode
                  ? 'The release is shaped for portfolio review: a cinematic product story on the front, a safe live trial in the middle, and a curated read-only dashboard behind it.'
                  : 'The release is shaped for portfolio review: a cinematic product story on the front, a safe live trial in the middle, and the actual admin surface behind it.'}
              </p>
            </div>

            <div className="grid gap-8 border-t border-white/8 lg:border-t-0">
              {releaseHighlights.map((highlight) => (
                <article
                  key={highlight.label}
                  className="grid gap-3 border-b border-white/8 py-6 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8"
                >
                  <p className="text-[0.72rem] font-medium uppercase tracking-[0.34em] text-[#ffbf6b]/84">
                    {highlight.label}
                  </p>
                  <p className="max-w-2xl text-base leading-7 text-[#f7f2e8]/66">
                    {highlight.value}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <LandingInteractiveSections publicDemoMode={publicDemoMode} />

        <section className="relative border-t border-white/8 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-[#ffbf6b]/18 bg-[linear-gradient(135deg,#17110a_0%,#0d0d0d_55%,#121212_100%)] px-6 py-12 sm:px-10 sm:py-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,191,107,0.18),_transparent_42%)]" />
              <div className="relative max-w-3xl">
                <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#ffbf6b]/84">
                  Final CTA
                </p>
                <h2 className="font-display mt-5 text-4xl leading-tight tracking-[-0.04em] text-[#f7f2e8] sm:text-5xl">
                  For house systems, student committees, and campus teams that
                  need the message to land cleanly.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#f7f2e8]/68">
                  Open Beacon and run announcements, polls, and follow-up edits
                  from a single command centre built for the way student outreach
                  actually works.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/try"
                    className="inline-flex items-center justify-center rounded-full bg-[#ffbf6b] px-6 py-3 text-sm font-semibold text-[#1c140b] transition-all hover:-translate-y-0.5 hover:bg-[#ffd28d]"
                  >
                    Try the public playground
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-full border border-[#f7f2e8]/18 px-6 py-3 text-sm font-medium text-[#f7f2e8] transition-all hover:border-[#f7f2e8]/40 hover:bg-white/6"
                  >
                    View the live dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
