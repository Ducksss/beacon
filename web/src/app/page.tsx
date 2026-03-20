"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

type DashboardData = {
  stats: {
    activeHouses: number;
    studentsReached: number;
    recentPollResponses: number;
  };
  recentBroadcasts: Array<{
    id: string;
    content: string;
    mediaUrl: string | null;
    createdAt: string;
    type: 'Poll' | 'Announcement';
  }>;
  pollSummaries: Array<{
    pollId: string;
    question: string;
    totalVotes: number;
    leadingOption: { text: string; votes: number } | null;
    options: Array<{
      optionIndex: number;
      text: string;
      votes: number;
    }>;
  }>;
  warning?: string;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

const demoStats = {
  activeHouses: 6,
  studentsReached: 1842,
  recentPollResponses: 376,
};

const demoBroadcasts = [
  {
    id: 'demo-1',
    content: 'Reminder: Welfare Pack collection is tomorrow, 10:00 AM to 4:00 PM at MPH. Bring your matric card for verification.',
    mediaUrl: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    type: 'Announcement' as const,
  },
  {
    id: 'demo-2',
    content: 'Interest Check: Would your house join a cross-house networking tea session next Friday evening?',
    mediaUrl: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    type: 'Poll' as const,
  },
  {
    id: 'demo-3',
    content: 'Applications are now open for Orientation Group Leaders. Deadline: Sunday 11:59 PM.',
    mediaUrl: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    type: 'Announcement' as const,
  },
];

const demoPollSummaries = [
  {
    pollId: 'demo-poll-1',
    question: 'Preferred timing for House Study Night?',
    totalVotes: 198,
    leadingOption: { text: '8:00 PM - 10:00 PM', votes: 92 },
    options: [
      { optionIndex: 0, text: '6:00 PM - 8:00 PM', votes: 51 },
      { optionIndex: 1, text: '8:00 PM - 10:00 PM', votes: 92 },
      { optionIndex: 2, text: 'Weekend Afternoon', votes: 55 },
    ],
  },
  {
    pollId: 'demo-poll-2',
    question: 'Preferred venue for Inter-House Mixer?',
    totalVotes: 178,
    leadingOption: { text: 'College Courtyard', votes: 74 },
    options: [
      { optionIndex: 0, text: 'College Courtyard', votes: 74 },
      { optionIndex: 1, text: 'Dining Hall Annex', votes: 63 },
      { optionIndex: 2, text: 'Virtual Session', votes: 41 },
    ],
  },
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/dashboard', {
          cache: 'no-store',
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load dashboard data');
        }

        setData(result);
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          setError((fetchError as Error).message || 'Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
    return () => controller.abort();
  }, []);

  const hasLiveContent =
    (data?.recentBroadcasts?.length ?? 0) > 0 ||
    (data?.pollSummaries?.length ?? 0) > 0 ||
    (data?.stats.activeHouses ?? 0) > 0;
  const showDemoContent = !loading && !error && !hasLiveContent;

  const stats = [
    { label: 'Active Houses', value: String(showDemoContent ? demoStats.activeHouses : data?.stats.activeHouses ?? 0) },
    { label: 'Students Reached', value: String(showDemoContent ? demoStats.studentsReached : data?.stats.studentsReached ?? 0) },
    { label: 'Recent Poll Responses', value: String(showDemoContent ? demoStats.recentPollResponses : data?.stats.recentPollResponses ?? 0) },
  ];

  const visibleBroadcasts = showDemoContent ? demoBroadcasts : data?.recentBroadcasts ?? [];
  const visiblePollSummaries = showDemoContent ? demoPollSummaries : data?.pollSummaries ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor your central outreach and engagement.</p>
        </div>
        <Link 
          href="/compose" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New Broadcast
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{stat.label}</h3>
            <div className="mt-2 text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {!loading && !error && data?.warning && (
        <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {data.warning}
        </div>
      )}

      {showDemoContent && (
        <div className="rounded-xl border border-blue-300/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
          Demo mode: showing sample broadcasts and poll results for presentation.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-6 pb-4 border-b border-border">
          <h3 className="font-semibold leading-none tracking-tight">Recent Broadcasts</h3>
          <p className="text-sm text-muted-foreground mt-1.5">Your latest announcements and polls.</p>
        </div>
        <div className="p-0">
          {loading && <p className="p-6 text-sm text-muted-foreground">Loading dashboard data...</p>}
          {error && <p className="p-6 text-sm text-red-300">{error}</p>}
          {!loading && !error && (
            <div className="divide-y divide-border">
              {visibleBroadcasts.map((b) => (
                <div key={b.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary/20 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                        {b.type}
                      </span>
                      <span className="text-sm text-muted-foreground">{formatDate(b.createdAt)}</span>
                    </div>
                    <p className="font-medium">{b.content}</p>
                  </div>
                </div>
              ))}
              {visibleBroadcasts.length === 0 && (
                <p className="p-6 text-sm text-muted-foreground">No broadcasts yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-6 pb-4 border-b border-border">
          <h3 className="font-semibold leading-none tracking-tight">Poll Collation</h3>
          <p className="text-sm text-muted-foreground mt-1.5">Aggregated vote trends across all house chats.</p>
        </div>
        <div className="divide-y divide-border">
          {loading && <p className="p-6 text-sm text-muted-foreground">Loading poll summaries...</p>}
          {!loading && !error && visiblePollSummaries.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">No poll data available yet.</p>
          )}
          {!loading && !error &&
            visiblePollSummaries.map((poll) => (
              <div key={poll.pollId} className="p-6 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <p className="font-medium">{poll.question}</p>
                  <span className="text-sm text-muted-foreground">{poll.totalVotes} total vote{poll.totalVotes === 1 ? '' : 's'}</span>
                </div>
                {poll.leadingOption && (
                  <p className="text-sm text-muted-foreground">
                    Leading option: <span className="text-foreground">{poll.leadingOption.text}</span> ({poll.leadingOption.votes})
                  </p>
                )}
                <div className="space-y-2">
                  {poll.options.map((option) => {
                    const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                    return (
                      <div key={`${poll.pollId}-${option.optionIndex}`} className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{option.text}</span>
                          <span>{option.votes} ({percentage}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
