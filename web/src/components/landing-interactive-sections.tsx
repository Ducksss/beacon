"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type SurfaceStory = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  bullets: string[];
  image: string;
  alt: string;
  href: string;
  ctaLabel: string;
};

type ViewerLens = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  statLabel: string;
  statValue: string;
  checkpoints: string[];
};

const defaultSurfaceStories: SurfaceStory[] = [
  {
    id: "playground",
    eyebrow: "Interactive Preview",
    title: "Start with the public playground.",
    summary:
      "The fastest way to understand Beacon is to use it. The playground makes the launch feel tangible by letting people test a real Telegram send without touching shared project data.",
    bullets: [
      "Paste your own bot token for a one-off live trial.",
      "Switch between announcement and poll flows without leaving the page.",
      "Keep the public release safe by isolating the send test from the shared analytics dataset.",
    ],
    image: "/beacon/try.png",
    alt: "Beacon public playground",
    href: "/try",
    ctaLabel: "Open the playground",
  },
  {
    id: "dashboard",
    eyebrow: "Shared Demo",
    title: "Move from trial into the system view.",
    summary:
      "After the live send, the dashboard shows the bigger operating picture: active houses, recent broadcasts, categories, and poll collation presented through realistic demo activity.",
    bullets: [
      "Explain the full product surface without exposing private operator controls.",
      "Show a coherent Beacon story for walkthroughs, interviews, and portfolio reviews.",
      "Use one curated dashboard to anchor the release around believable product behaviour.",
    ],
    image: "/beacon/dashboard.png",
    alt: "Beacon shared demo dashboard",
    href: "/dashboard",
    ctaLabel: "View the dashboard",
  },
  {
    id: "compose",
    eyebrow: "Operator Surface",
    title: "Reveal what sits behind the demo layer.",
    summary:
      "The compose flow closes the loop by showing that Beacon is not just a static front-end release. It exposes the operational surface where committees prepare real announcements and interest checks.",
    bullets: [
      "Draft announcements or polls from a single calm command centre.",
      "Choose categories and delivery targets before a Telegram push.",
      "Turn the public product story into a clear internal-ops workflow.",
    ],
    image: "/beacon/compose.png",
    alt: "Beacon compose workflow",
    href: "/compose",
    ctaLabel: "See the compose flow",
  },
];

const faqItems = [
  {
    question: "Why does the release have both a playground and a dashboard?",
    answer:
      "They do different jobs. The playground proves Beacon can drive a real Telegram send, while the dashboard shows the broader product system through shared demo data without exposing risky admin actions.",
  },
  {
    question: "What makes this feel more than a static portfolio page?",
    answer:
      "The release is built around actual product routes. Visitors can trigger a real send in the public playground, move into a believable system dashboard, and understand how the internal operator workflow works behind it.",
  },
  {
    question: "How does public demo mode stay safe?",
    answer:
      "The demo keeps sensitive metadata and write-heavy controls behind guarded routes, uses curated shared data for the dashboard, and treats the playground as a one-off proxy flow rather than a multi-tenant product backend.",
  },
  {
    question: "What should a reviewer explore first?",
    answer:
      "Start with the playground to understand the live value quickly, then open the shared dashboard to see campaign history and poll collation, and finally inspect compose to understand the full operator surface.",
  },
];

const releaseDepth = [
  {
    label: "What visitors can do",
    value:
      "Test a live Telegram flow, inspect a curated dashboard, and map the public story back to the operator workflow.",
  },
  {
    label: "What stays protected",
    value:
      "Private metadata, unsafe write paths, and internal-only admin controls remain outside the public demo boundary.",
  },
  {
    label: "Why this release lands",
    value:
      "It balances portfolio polish with real product behaviour, so the page feels cinematic without becoming detached from the application itself.",
  },
  {
    label: "Where it can go next",
    value:
      "Authentication, scheduling, and deeper analytics can layer onto the same structure without changing the core public story.",
  },
];

const signalRail = [
  "Live Telegram send",
  "Read-only shared dashboard",
  "Public demo guardrails",
  "Operator compose surface",
  "Poll collation",
  "Portfolio-ready release",
  "Real product routes",
  "Safe public trial",
];

const viewerLenses: ViewerLens[] = [
  {
    id: "reviewer",
    label: "Reviewer",
    eyebrow: "Portfolio Lens",
    title: "See the release as a product story that already has its own demo choreography.",
    summary:
      "This lens is about how clearly the launch communicates capability. A reviewer should understand the value in one sweep: try something live, inspect the system, then trace it back to the operator surface.",
    statLabel: "First impression",
    statValue: "Live > Static",
    checkpoints: [
      "The page points directly into a real public trial instead of a dead mockup.",
      "The dashboard proves product depth beyond a single hero moment.",
      "The compose flow shows there is an operational core behind the cinematic wrapper.",
    ],
  },
  {
    id: "operator",
    label: "Operator",
    eyebrow: "Workflow Lens",
    title: "See Beacon as an internal comms tool with a public-safe edge.",
    summary:
      "This lens focuses on operational trust. The release should show that Beacon can support real campus teams while still protecting internal controls when the app is opened publicly.",
    statLabel: "Core promise",
    statValue: "Calm control room",
    checkpoints: [
      "Public users can test the sending flow without touching shared project analytics.",
      "The dashboard remains useful for demos even when write-heavy actions are restricted.",
      "The operator path still reads like a serious internal workflow rather than a portfolio-only façade.",
    ],
  },
  {
    id: "builder",
    label: "Builder",
    eyebrow: "System Lens",
    title: "See how the release balances polish, guardrails, and product truth.",
    summary:
      "This lens is for people who care how the thing was shaped. Beacon is interesting because the public story is not detached from the codebase; it is assembled around real routes, real constraints, and carefully chosen demo boundaries.",
    statLabel: "Interesting bit",
    statValue: "Narrative architecture",
    checkpoints: [
      "The landing page is driven by the same routes the product actually exposes.",
      "Public demo mode changes what is shown and what is protected instead of faking a separate brochure app.",
      "The release can grow into authentication, scheduling, and deeper analytics without discarding the current public story.",
    ],
  },
];

export function LandingInteractiveSections({
  publicDemoMode,
}: {
  publicDemoMode: boolean;
}) {
  const surfaceStories = useMemo(() => {
    if (!publicDemoMode) {
      return defaultSurfaceStories.map((story) =>
        story.id === "dashboard"
          ? {
              ...story,
              summary:
                "After the live send, the dashboard shifts from shared demo surface to the real working control room: active houses, recent broadcasts, categories, and poll collation in one operational view.",
            }
          : story,
      );
    }

    return defaultSurfaceStories;
  }, [publicDemoMode]);

  const [activeSurfaceId, setActiveSurfaceId] = useState(surfaceStories[0].id);
  const [openQuestion, setOpenQuestion] = useState(faqItems[0].question);
  const [activeLensId, setActiveLensId] = useState(viewerLenses[0].id);

  const activeSurface =
    surfaceStories.find((story) => story.id === activeSurfaceId) ??
    surfaceStories[0];
  const activeLens =
    viewerLenses.find((lens) => lens.id === activeLensId) ?? viewerLenses[0];

  return (
    <>
      <section className="relative border-t border-white/8 bg-[#0b0b0b]/96 py-6">
        <div className="overflow-hidden">
          <div className="marquee-track flex min-w-max gap-3 px-5 sm:px-8 lg:px-10">
            {[...signalRail, ...signalRail].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.72rem] uppercase tracking-[0.24em] text-[#f7f2e8]/62"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/8 bg-[#0a0a0a]/92 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
            <div className="max-w-lg">
              <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#ffbf6b]/78">
                Interactive Walkthrough
              </p>
              <h2 className="font-display mt-5 text-4xl leading-tight tracking-[-0.04em] text-[#f7f2e8] sm:text-5xl">
                Explore the release the way a reviewer actually would.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#f7f2e8]/66">
                Switch between the major surfaces below. The page now explains
                the launch through interaction, not just static hero copy.
              </p>

              <div className="mt-8 space-y-3">
                {surfaceStories.map((story) => {
                  const isActive = story.id === activeSurface.id;

                  return (
                    <button
                      key={story.id}
                      type="button"
                      onMouseEnter={() => setActiveSurfaceId(story.id)}
                      onFocus={() => setActiveSurfaceId(story.id)}
                      onClick={() => setActiveSurfaceId(story.id)}
                      className={`w-full rounded-[1.35rem] border px-4 py-4 text-left transition-all duration-300 ${
                        isActive
                          ? "border-[#ffbf6b]/30 bg-[#ffbf6b]/8 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
                          : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]"
                      }`}
                    >
                      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#ffbf6b]/80">
                        {story.eyebrow}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[#f7f2e8]">
                        {story.title}
                      </h3>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="soft-panel rounded-[2rem] border border-white/8 p-4 sm:p-5">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#101010]">
                  <div className="relative aspect-[16/10]">
                    <Image
                      key={activeSurface.image}
                      src={activeSurface.image}
                      alt={activeSurface.alt}
                      fill
                      sizes="(min-width: 1280px) 48rem, 90vw"
                      className="object-cover object-left-top transition-opacity duration-300"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#ffbf6b]/80">
                      {activeSurface.eyebrow}
                    </p>
                    <h3 className="font-display mt-4 text-3xl leading-tight tracking-[-0.03em] text-[#f7f2e8]">
                      {activeSurface.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#f7f2e8]/62">
                      {activeSurface.summary}
                    </p>

                    <div className="mt-6 space-y-3">
                      {activeSurface.bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="flex gap-3 border-b border-white/8 pb-3 last:border-b-0 last:pb-0"
                        >
                          <span className="mt-1 size-2 rounded-full bg-[#ffbf6b]" />
                          <p className="text-sm leading-6 text-[#f7f2e8]/64">
                            {bullet}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link
                      href={activeSurface.href}
                      className="inline-flex items-center justify-center rounded-full border border-[#ffbf6b]/24 bg-[#ffbf6b]/10 px-5 py-3 text-sm font-medium text-[#ffe0b6] transition-all hover:border-[#ffbf6b]/40 hover:bg-[#ffbf6b]/16"
                    >
                      {activeSurface.ctaLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/8 bg-[#090909]/92 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
            <div className="max-w-lg">
              <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#ffbf6b]/78">
                Pick Your Lens
              </p>
              <h2 className="font-display mt-5 text-4xl leading-tight tracking-[-0.04em] text-[#f7f2e8] sm:text-5xl">
                The same release reads differently depending on who is looking.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#f7f2e8]/66">
                Switch perspectives below. This adds more substance to the page
                without repeating the same surface tour a second time.
              </p>

              <div className="mt-8 grid gap-3">
                {viewerLenses.map((lens) => {
                  const isActive = lens.id === activeLens.id;

                  return (
                    <button
                      key={lens.id}
                      type="button"
                      onMouseEnter={() => setActiveLensId(lens.id)}
                      onFocus={() => setActiveLensId(lens.id)}
                      onClick={() => setActiveLensId(lens.id)}
                      className={`rounded-[1.35rem] border px-4 py-4 text-left transition-all duration-300 ${
                        isActive
                          ? "border-[#ffbf6b]/30 bg-[#ffbf6b]/8 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
                          : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]"
                      }`}
                    >
                      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#ffbf6b]/80">
                        {lens.eyebrow}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-[#f7f2e8]">
                        {lens.label}
                      </h3>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="soft-panel rounded-[2rem] border border-white/8 p-4 sm:p-5">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_14rem]">
                <div className="rounded-[1.6rem] border border-white/8 bg-[#0d0d0d] p-5">
                  <p className="text-[0.68rem] uppercase tracking-[0.3em] text-[#ffbf6b]/80">
                    {activeLens.eyebrow}
                  </p>
                  <h3 className="font-display mt-4 text-4xl leading-tight tracking-[-0.04em] text-[#f7f2e8]">
                    {activeLens.title}
                  </h3>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-[#f7f2e8]/62">
                    {activeLens.summary}
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {activeLens.checkpoints.map((checkpoint, index) => (
                      <article
                        key={checkpoint}
                        className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4"
                      >
                        <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[#ffbf6b]/78">
                          0{index + 1}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#f7f2e8]/64">
                          {checkpoint}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#ffbf6b]/80">
                      {activeLens.statLabel}
                    </p>
                    <p className="font-display mt-4 text-4xl leading-none text-[#f7f2e8]">
                      {activeLens.statValue}
                    </p>
                  </div>

                  <div className="rounded-[1.35rem] border border-white/8 bg-[#0d0d0d] p-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[#f7f2e8]/40">
                      Why it feels cool
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#f7f2e8]/60">
                      The release is not just prettier now. It gives each kind of
                      viewer a stronger reason to keep exploring.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/8 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-14">
            <div className="max-w-lg">
              <p className="text-[0.72rem] uppercase tracking-[0.38em] text-[#ffbf6b]/78">
                More Detail
              </p>
              <h2 className="font-display mt-5 text-4xl leading-tight tracking-[-0.04em] text-[#f7f2e8] sm:text-5xl">
                More answers, more context, less guesswork.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#f7f2e8]/66">
                This section gives the landing page more depth so the release
                can stand on its own even before someone clicks into the app.
              </p>

              <div className="mt-8 space-y-4">
                {releaseDepth.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[#ffbf6b]/78">
                      {item.label}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#f7f2e8]/62">
                      {item.value}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="soft-panel rounded-[2rem] border border-white/8 p-4 sm:p-5">
              <div className="rounded-[1.6rem] border border-white/8 bg-[#0d0d0d] p-3">
                <div className="border-b border-white/8 px-3 pb-3">
                  <p className="text-[0.72rem] uppercase tracking-[0.34em] text-[#ffbf6b]/78">
                    FAQ
                  </p>
                  <h3 className="mt-3 font-display text-3xl leading-tight tracking-[-0.03em] text-[#f7f2e8]">
                    Questions the page should answer on its own.
                  </h3>
                </div>

                <div className="mt-2">
                  {faqItems.map((item) => {
                    const isOpen = item.question === openQuestion;

                    return (
                      <article
                        key={item.question}
                        className="border-b border-white/8 last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenQuestion(isOpen ? "" : item.question)
                          }
                          className="flex w-full items-center justify-between gap-4 px-3 py-4 text-left"
                        >
                          <span className="text-base font-medium text-[#f7f2e8]">
                            {item.question}
                          </span>
                          <span
                            className={`text-xl leading-none text-[#ffbf6b] transition-transform duration-300 ${
                              isOpen ? "rotate-45" : ""
                            }`}
                          >
                            +
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-4">
                            <p className="max-w-3xl text-sm leading-7 text-[#f7f2e8]/62">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
