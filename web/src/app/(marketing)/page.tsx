import Image from "next/image";
import Link from "next/link";
import { isPublicDemoMode } from "@/lib/public-demo";

const featureRows = [
  {
    index: "01",
    title: "Broadcast once. Reach every house.",
    body: "Draft one announcement from the CSC desk, dispatch it across active house chats, and keep delivery consistent without copy-paste chaos.",
    image: "/beacon/compose.png",
    alt: "Beacon compose interface for announcements and polls",
  },
  {
    index: "02",
    title: "Run interest checks where students already are.",
    body: "Launch quick polls inside Telegram, then watch the dashboard collate signal across every house so committees can make the next call faster.",
    image: "/beacon/dashboard.png",
    alt: "Beacon dashboard showing broadcasts and poll collation",
  },
  {
    index: "03",
    title: "Fix the message without losing the thread.",
    body: "Correct categories, clean up wording, and keep live comms aligned after send instead of chasing edits in six separate group chats.",
    image: "/beacon/categories.png",
    alt: "Beacon category management interface",
  },
];

const workflowSteps = [
  {
    index: "01",
    title: "Shape the message at the centre.",
    body: "Committee leads prepare a clean announcement or poll, tag it by campaign or event, and choose exactly which house chats should receive it.",
  },
  {
    index: "02",
    title: "Beacon handles the distributed send.",
    body: "Telegram delivery stays standardized across decentralized house networks, so every student sees the same wording, timing, and context.",
  },
  {
    index: "03",
    title: "Read the response without spreadsheet cleanup.",
    body: "The dashboard keeps a live view of broadcasts, vote trends, and campaign categories, so follow-up decisions happen from one shared source of truth.",
  },
];

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

const creatorProfile = {
  name: "Chai Pin Zheng",
  role: "Builder of Beacon",
  bio: "I build product-led demos and operational tools with a focus on clear systems, calm interfaces, and workflows that feel ready for real teams.",
  links: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/chai-pin-zheng/",
    },
    {
      label: "GitHub",
      href: "https://github.com/Ducksss",
    },
    {
      label: "View source",
      href: "https://github.com/ducksss/beacon",
    },
    {
      label: "Try Beacon",
      href: "/try",
    },
  ],
};

export default function LandingPage() {
  const publicDemoMode = isPublicDemoMode();
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
                    src="/beacon/compose.png"
                    alt="Beacon compose view"
                    fill
                    sizes="(min-width: 1024px) 18rem, 44vw"
                    className="object-cover object-left-top"
                  />
                </div>
                <div className="reveal-scale absolute bottom-[2%] right-[3%] h-[24%] w-[44%] overflow-hidden rounded-[1.5rem] border border-[#ffbf6b]/18 bg-[#0f0f0f] shadow-[0_24px_80px_rgba(0,0,0,0.35)] [animation-delay:300ms]">
                  <Image
                    src="/beacon/categories.png"
                    alt="Beacon category management"
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

        <section
          id="proof"
          className="relative border-t border-white/8 bg-[#0c0c0c]/90 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#ffbf6b]/78">
                Product Proof
              </p>
              <h2 className="font-display mt-5 text-4xl leading-tight tracking-[-0.04em] text-[#f7f2e8] sm:text-5xl">
                Built for committees that need reach, clarity, and a record of
                what actually happened.
              </h2>
            </div>

            <div className="mt-16 border-t border-white/8">
              {featureRows.map((feature) => (
                <article
                  key={feature.title}
                  className="grid gap-8 border-b border-white/8 py-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-center lg:gap-14"
                >
                  <div className="max-w-xl">
                    <p className="text-sm uppercase tracking-[0.3em] text-[#f7f2e8]/38">
                      {feature.index}
                    </p>
                    <h3 className="mt-4 font-display text-3xl leading-tight tracking-[-0.03em] text-[#f7f2e8]">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-[#f7f2e8]/66">
                      {feature.body}
                    </p>
                  </div>
                  <div className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#111111]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,191,107,0.16),_transparent_44%)] opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={feature.image}
                        alt={feature.alt}
                        fill
                        sizes="(min-width: 1024px) 42rem, 90vw"
                        className="object-cover object-left-top transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/8 py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-20 lg:px-10">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#ffbf6b]/78">
                Workflow
              </p>
              <h2 className="font-display mt-5 text-4xl leading-tight tracking-[-0.04em] text-[#f7f2e8] sm:text-5xl">
                A calmer operating rhythm for campus-wide updates.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#f7f2e8]/64">
                Beacon is designed around the actual path of a campus message:
                draft at the centre, deliver through local channels, then read the
                signal back without manual cleanup.
              </p>
              <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[#121212]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,191,107,0.12),_transparent_46%)]" />
                <div className="relative aspect-[4/5]">
                  <Image
                    src="/beacon/dashboard.png"
                    alt="Beacon dashboard overview"
                    fill
                    sizes="(min-width: 1024px) 24rem, 90vw"
                    className="object-cover object-left-top"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {workflowSteps.map((step) => (
                <article
                  key={step.index}
                  className="group relative border-l border-white/10 pl-7"
                >
                  <div className="absolute left-[-0.48rem] top-1 size-4 rounded-full border border-[#ffbf6b]/55 bg-[#090909] shadow-[0_0_0_6px_rgba(9,9,9,1)] transition-colors duration-300 group-hover:border-[#ffbf6b]" />
                  <p className="text-xs uppercase tracking-[0.35em] text-[#ffbf6b]/82">
                    {step.index}
                  </p>
                  <h3 className="mt-4 font-display text-3xl leading-tight tracking-[-0.03em] text-[#f7f2e8]">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-base leading-7 text-[#f7f2e8]/66">
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

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

      <footer className="relative border-t border-white/8 bg-[#080808]/96">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="flex flex-col gap-6 border-t border-white/6 pt-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[0.68rem] uppercase tracking-[0.34em] text-[#ffbf6b]/58">
                Built by {creatorProfile.name}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#f7f2e8]/50 sm:text-[0.95rem]">
                {creatorProfile.bio}
              </p>
            </div>

            <div className="flex flex-col gap-4 text-sm text-[#f7f2e8]/42 lg:items-end">
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {creatorProfile.links.map((link) => {
                  const isInternal = link.href.startsWith("/");
                  const className =
                    "transition-colors hover:text-[#f7f2e8]/72";

                  return isInternal ? (
                    <Link key={link.label} href={link.href} className={className}>
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={className}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
              <p>© {new Date().getFullYear()} Beacon</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
