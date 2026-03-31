"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BroadcastType = "message" | "poll";

type PlaygroundResponse = {
  sentCount: number;
  failedCount: number;
  failures?: string[];
};

const launchSignals = [
  "No token storage",
  "Telegram-native send test",
  "Safe portfolio demo route",
];

const setupSteps = [
  {
    title: "Create a bot with BotFather",
    body: "Generate a Telegram bot token and keep it just for your own test run.",
  },
  {
    title: "Add the bot to a chat",
    body: "Use a direct message or group where the bot already has permission to post.",
  },
  {
    title: "Send a live announcement or poll",
    body: "Beacon proxies a one-off Telegram request without writing to the shared project data.",
  },
];

const guardrails = [
  "Tokens are used only for the current request and are not persisted by the app.",
  "The playground supports announcements with optional image URLs and single-choice polls.",
  "The trial route is capped at 10 chat IDs per request and rate-limited for safe public use.",
];

function parseChatIds(value: string): string[] {
  return [...new Set(
    value
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

export default function TryBeaconPage() {
  const [botToken, setBotToken] = useState("");
  const [type, setType] = useState<BroadcastType>("message");
  const [chatIdsInput, setChatIdsInput] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [failureDetails, setFailureDetails] = useState<string[]>([]);

  const parsedChatIds = useMemo(() => parseChatIds(chatIdsInput), [chatIdsInput]);
  const activeOptions = options.map((option) => option.trim()).filter(Boolean);

  const updateOption = (index: number, value: string) => {
    setOptions((current) =>
      current.map((item, itemIndex) => itemIndex === index ? value : item)
    );
  };

  const addOption = () => {
    setOptions((current) => [...current, ""]);
  };

  const applyAnnouncementTemplate = () => {
    setType("message");
    setContent(
      "Reminder: Welfare Pack collection is tomorrow, 10:00 AM to 4:00 PM at MPH. Bring your matric card for verification."
    );
    setMediaUrl(
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80"
    );
  };

  const applyPollTemplate = () => {
    setType("poll");
    setContent("Interest Check: Which timeslot works best for next Friday?");
    setOptions([
      "6:00 PM - 7:30 PM",
      "7:30 PM - 9:00 PM",
      "I cannot attend",
    ]);
    setMediaUrl("");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setResult(null);
    setFailureDetails([]);

    try {
      const response = await fetch("/api/try/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          botToken,
          type,
          chatIds: parsedChatIds,
          content,
          mediaUrl: type === "message" ? mediaUrl : undefined,
          options: type === "poll" ? options : undefined,
        }),
      });

      const data = (await response.json()) as PlaygroundResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to send playground broadcast");
      }

      setResult(
        `Sent to ${data.sentCount} chat${data.sentCount === 1 ? "" : "s"}${
          data.failedCount ? ` (${data.failedCount} failed)` : ""
        }.`
      );
      setFailureDetails(data.failures ?? []);
    } catch (submitError) {
      setError(
        (submitError as Error).message || "Failed to send playground broadcast"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    botToken.trim().length > 0 &&
    parsedChatIds.length > 0 &&
    content.trim().length > 0 &&
    (type === "message" || activeOptions.length >= 2);

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_22rem]">
        <div className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-white/54 transition-colors hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to the product story
          </Link>

          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-[#ffbf6b]/22 bg-[#ffbf6b]/8 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#ffe0b6]">
              Public Playground
            </span>
            <h1 className="font-display max-w-4xl text-5xl leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl">
              Let anyone test Beacon live with their own Telegram bot.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/64 sm:text-lg">
              This route is shaped for demos and portfolio review: visitors can
              paste a Telegram bot token, send a real announcement or poll, and
              understand the product without writing into the shared Beacon
              analytics layer.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {launchSignals.map((signal) => (
              <span
                key={signal}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.72rem] uppercase tracking-[0.22em] text-white/70"
              >
                {signal}
              </span>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {setupSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5"
              >
                <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[#ffbf6b]/78">
                  0{index + 1}
                </p>
                <h2 className="mt-3 text-base font-semibold text-white">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/58">{step.body}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="soft-panel rounded-[1.75rem] border border-white/8 p-5">
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#ffbf6b]/78">
            Demo Guardrails
          </p>
          <div className="mt-5 space-y-4">
            {guardrails.map((guardrail) => (
              <div key={guardrail} className="border-b border-white/8 pb-4 last:border-b-0 last:pb-0">
                <p className="text-sm leading-6 text-white/64">{guardrail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-[#ffbf6b]/16 bg-[#ffbf6b]/6 p-4">
            <p className="text-sm font-semibold text-white">What this demo proves</p>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Beacon is not just a static mockup. This page exercises a real
              Telegram send flow while preserving a clean boundary around the
              main dashboard data.
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[1.9rem] border border-white/8 bg-[#0b0b0b]/72">
          <div className="section-divider border-b border-white/8 px-6 py-6 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#ffbf6b]/78">
                  Live Trial
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Send a real Telegram announcement or poll
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
                  Fill in your bot token, target chats, and message payload below.
                  Beacon will proxy a single request through the public demo route.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={applyAnnouncementTemplate}
                  className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/72 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Load announcement
                </button>
                <button
                  onClick={applyPollTemplate}
                  className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/72 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Load poll
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-8 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Telegram Bot Token</label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(event) => setBotToken(event.target.value)}
                  placeholder="123456789:AA..."
                  className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white shadow-sm transition-colors placeholder:text-white/28 hover:border-white/16 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ffbf6b]/50"
                />
                <p className="text-xs text-white/44">
                  Submitted only for this request. Beacon does not persist it in
                  the database.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Chat IDs</label>
                <textarea
                  value={chatIdsInput}
                  onChange={(event) => setChatIdsInput(event.target.value)}
                  placeholder="-1001234567890, -1009876543210"
                  className="flex min-h-28 w-full rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white shadow-sm transition-colors placeholder:text-white/28 hover:border-white/16 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ffbf6b]/50"
                />
                <p className="text-xs text-white/44">
                  Separate multiple chat IDs with commas, spaces, or new lines.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white">Broadcast Type</label>
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    onClick={() => setType("message")}
                    className={`rounded-[1.5rem] border px-5 py-4 text-left transition-colors ${
                      type === "message"
                        ? "border-[#ffbf6b]/28 bg-[#ffbf6b]/8 text-white"
                        : "border-white/8 bg-white/[0.03] text-white/56 hover:text-white"
                    }`}
                  >
                    <p className="font-semibold">Announcement</p>
                    <p className="mt-1 text-sm opacity-80">
                      Send text with an optional image URL.
                    </p>
                  </button>
                  <button
                    onClick={() => setType("poll")}
                    className={`rounded-[1.5rem] border px-5 py-4 text-left transition-colors ${
                      type === "poll"
                        ? "border-[#ffbf6b]/28 bg-[#ffbf6b]/8 text-white"
                        : "border-white/8 bg-white/[0.03] text-white/56 hover:text-white"
                    }`}
                  >
                    <p className="font-semibold">Poll</p>
                    <p className="mt-1 text-sm opacity-80">
                      Send a single-choice Telegram poll.
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  {type === "message" ? "Announcement Content" : "Poll Question"}
                </label>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={
                    type === "message"
                      ? "Reminder: Welfare Pack collection is tomorrow at MPH."
                      : "Which timeslot works best for next Friday?"
                  }
                  className="flex min-h-36 w-full rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white shadow-sm transition-colors placeholder:text-white/28 hover:border-white/16 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ffbf6b]/50"
                />
              </div>

              {type === "message" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(event) => setMediaUrl(event.target.value)}
                    placeholder="https://example.com/poster.png"
                    className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white shadow-sm transition-colors placeholder:text-white/28 hover:border-white/16 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ffbf6b]/50"
                  />
                </div>
              )}

              {type === "poll" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-medium text-white">
                      Poll Options
                    </label>
                    <button
                      onClick={addOption}
                      disabled={options.length >= 10}
                      className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <input
                        key={index}
                        type="text"
                        value={option}
                        onChange={(event) => updateOption(index, event.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white shadow-sm transition-colors placeholder:text-white/28 hover:border-white/16 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ffbf6b]/50"
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-[1.2rem] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              {result && (
                <div className="rounded-[1.2rem] border border-emerald-400/22 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
                  <p>{result}</p>
                  {failureDetails.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs text-emerald-100/88">
                      {failureDetails.map((failure, index) => (
                        <p key={index}>{failure}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#ffbf6b] px-6 text-sm font-semibold text-[#1c140b] transition-all hover:-translate-y-0.5 hover:bg-[#ffd28d] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {submitting ? "Sending..." : `Send ${type === "message" ? "Announcement" : "Poll"}`}
              </button>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[0.72rem] uppercase tracking-[0.3em] text-[#ffbf6b]/78">
                  Live Snapshot
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/36">
                      Targets
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-white">
                      {parsedChatIds.length}
                    </p>
                    <p className="text-xs text-white/42">
                      Up to 10 chat IDs per request
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/36">
                      Mode
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {type === "message" ? "Announcement send" : "Single-choice poll"}
                    </p>
                  </div>
                  {type === "poll" && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/36">
                        Active options
                      </p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {activeOptions.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                <p className="text-[0.72rem] uppercase tracking-[0.3em] text-[#ffbf6b]/78">
                  Before You Test
                </p>
                <div className="mt-4 space-y-4 text-sm leading-6 text-white/58">
                  <p>
                    Your bot must already be present in the target chat, and
                    group chats may require admin permissions for polling.
                  </p>
                  <p>
                    If you do not know a chat ID yet, inspect the incoming update
                    payload from Telegram or use a helper bot like{" "}
                    <span className="font-medium text-white">@userinfobot</span>.
                  </p>
                  <p>
                    Poll analytics, categories, and live edit history still live
                    in the full Beacon deployment backed by Supabase and a
                    webhook.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <aside className="rounded-[1.75rem] border border-white/8 bg-[#0b0b0b]/72 p-5">
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#ffbf6b]/78">
            Demo Context
          </p>
          <h3 className="mt-4 text-xl font-semibold text-white">
            Why this page matters in the release
          </h3>
          <div className="mt-4 space-y-4 text-sm leading-6 text-white/58">
            <p>
              The playground makes the project legible in one click: people can
              feel the Telegram integration immediately without having to clone,
              deploy, or wire their own database first.
            </p>
            <p>
              It also keeps the main dashboard cleaner during demos, because test
              sends here do not pollute your shared broadcast history.
            </p>
          </div>
          <div className="mt-6 rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/36">
              Suggested demo arc
            </p>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Start on the landing page, move into this playground for the live
              send, then open the dashboard to explain the full operator surface.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
