"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  publicDemoModeEnabled,
  PUBLIC_DEMO_DATASET_MESSAGE,
} from '@/lib/public-demo';

type DashboardData = {
  stats: {
    activeHouses: number;
    studentsReached: number;
    recentPollResponses: number;
  };
  categories?: Array<{ id: string; name: string; color: string; }>;
  recentBroadcasts: Array<{
    id: string;
    content: string;
    mediaUrl: string | null;
    createdAt: string;
    type: 'Poll' | 'Announcement';
    category?: { id: string; name: string; color: string; } | null;
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
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

const demoStats = {
  activeHouses: 6,
  studentsReached: 1842,
  recentPollResponses: 376,
};

const demoBroadcasts: DashboardData['recentBroadcasts'] = [
  {
    id: 'demo-1',
    content: 'Reminder: Welfare Pack collection is tomorrow, 10:00 AM to 4:00 PM at MPH. Bring your matric card for verification.',
    mediaUrl: null,
    createdAt: '2026-03-31T05:00:00.000Z',
    type: 'Announcement' as const,
  },
  {
    id: 'demo-2',
    content: 'Interest Check: Would your house join a cross-house networking tea session next Friday evening?',
    mediaUrl: null,
    createdAt: '2026-03-30T12:00:00.000Z',
    type: 'Poll' as const,
  },
  {
    id: 'demo-3',
    content: 'Applications are now open for Orientation Group Leaders. Deadline: Sunday 11:59 PM.',
    mediaUrl: null,
    createdAt: '2026-03-29T22:00:00.000Z',
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
  const isPublicDemoMode = publicDemoModeEnabled;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

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
  const showDemoContent = isPublicDemoMode && !loading && !error && !hasLiveContent;
  const canManageLiveData = !isPublicDemoMode;
  const canEditBroadcasts = !isPublicDemoMode && !showDemoContent;

  const stats = [
    { label: 'Active Houses', value: String(showDemoContent ? demoStats.activeHouses : data?.stats.activeHouses ?? 0) },
    { label: 'Students Reached', value: String(showDemoContent ? demoStats.studentsReached : data?.stats.studentsReached ?? 0) },
    { label: 'Recent Poll Responses', value: String(showDemoContent ? demoStats.recentPollResponses : data?.stats.recentPollResponses ?? 0) },
  ];

  const handleEditClick = (broadcast: DashboardData['recentBroadcasts'][number]) => {
    setEditingId(broadcast.id);
    setEditContent(broadcast.content);
    setEditCategoryId(broadcast.category?.id || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditCategoryId('');
  };

  const handleSaveEdit = async (id: string, isPoll: boolean) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/broadcast/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: editCategoryId || null,
          content: !isPoll ? editContent : undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      // Optimistic update
      setData((prev) => {
        if (!prev) return prev;
        const newCat = prev.categories?.find(c => c.id === editCategoryId) || null;
        return {
          ...prev,
          recentBroadcasts: prev.recentBroadcasts.map(b => 
            b.id === id ? { ...b, category: newCat, content: !isPoll ? editContent : b.content } : b
          )
        };
      });
      setEditingId(null);
    } catch (err: unknown) {
      alert(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const rawBroadcasts = showDemoContent ? demoBroadcasts : data?.recentBroadcasts ?? [];
  const visibleBroadcasts = selectedCategory
    ? rawBroadcasts.filter(b => b.category?.id === selectedCategory)
    : rawBroadcasts;

  const visiblePollSummaries = showDemoContent ? demoPollSummaries : data?.pollSummaries ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="space-y-4">
          <span className="inline-flex rounded-full border border-[#ffbf6b]/22 bg-[#ffbf6b]/8 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#ffe0b6]">
            {isPublicDemoMode ? 'Shared Demo Dashboard' : 'Operator Surface'}
          </span>
          <div>
            <h1 className="font-display text-4xl leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              {isPublicDemoMode
                ? 'Show the Beacon story through a curated, Supabase-backed demo dashboard.'
                : 'Monitor delivery, polling, and message quality from one calm control room.'}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
              {isPublicDemoMode
                ? 'This public view stays read-only so visitors can explore realistic Beacon activity, category coverage, and poll collation without exposing the shared admin workflow.'
                : 'This is the working side of Beacon: the place where campus operators can monitor active houses, review outgoing broadcasts, and read poll trends without cleaning spreadsheets after every Telegram push.'}
            </p>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#ffbf6b]/74">
            Demo Context
          </p>
          <p className="mt-3 text-sm leading-6 text-white/58">
            {isPublicDemoMode
              ? 'Use this dashboard in walkthroughs after the playground to show Beacon with curated shared data while keeping compose and edit actions private.'
              : 'Use this dashboard in walkthroughs after the public playground to show the fuller operator workflow and where Beacon becomes a real internal tool.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-white/40">
            Overview
          </h2>
          <p className="mt-1 text-sm text-white/52">
            Central visibility across broadcasts, categories, and poll engagement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/try" 
            className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-400/28 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-50 transition-colors hover:bg-emerald-500/18"
          >
            Try Online
          </Link>
          {canManageLiveData && (
            <>
              <Link 
                href="/settings/categories" 
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/72 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Manage Categories
              </Link>
              <Link 
                href="/compose" 
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#ffbf6b] px-4 text-sm font-semibold text-[#1c140b] transition-all hover:-translate-y-0.5 hover:bg-[#ffd28d]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                New Broadcast
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.05]">
            <h3 className="text-sm font-medium tracking-tight text-white/50">{stat.label}</h3>
            <div className="mt-3 text-4xl font-semibold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {!loading && !error && data?.warning && (
        <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {data.warning}
        </div>
      )}

      {isPublicDemoMode && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-100">Shareable Playground</p>
              <p className="text-sm text-emerald-50">
                Want the community to test Beacon online with their own Telegram bot token first? Use the public playground to try live announcements and polls without touching your shared Supabase data.
              </p>
            </div>
            <Link
              href="/try"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Open Playground
            </Link>
          </div>
        </div>
      )}

      {showDemoContent && (
        <div className="rounded-xl border border-blue-300/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
          {isPublicDemoMode
            ? 'Public demo fallback: showing bundled sample data for presentation. Apply web/supabase/demo-seed.sql to restore the curated shared demo dataset.'
            : 'Demo mode: showing sample broadcasts and poll results for presentation.'}
        </div>
      )}

      {isPublicDemoMode && !loading && !error && !showDemoContent && (
        <div className="rounded-xl border border-sky-300/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
          <>
            {PUBLIC_DEMO_DATASET_MESSAGE} The public playground on <span className="font-semibold text-white">Try Online</span> stays live, but it does not write broadcasts, votes, or analytics into this shared demo view.
          </>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-6 pb-4 border-b border-border space-y-4">
          <div>
            <h3 className="font-semibold leading-none tracking-tight">Recent Broadcasts</h3>
            <p className="text-sm text-muted-foreground mt-1.5">Your latest announcements and polls.</p>
          </div>
          {data?.categories && data.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${!selectedCategory ? 'bg-primary text-primary-foreground shadow hover:bg-primary/80' : 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground'}`}
              >
                All
              </button>
              {data.categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border ${selectedCategory === c.id ? 'bg-secondary text-secondary-foreground shadow-sm' : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground'}`}
                >
                  <div className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-0">
          {loading && <p className="p-6 text-sm text-muted-foreground">Loading dashboard data...</p>}
          {error && <p className="p-6 text-sm text-red-300">{error}</p>}
          {!loading && !error && (
            <div className="divide-y divide-border">
              {visibleBroadcasts.map((b) => (
                <div key={b.id} className="p-6 hover:bg-secondary/20 transition-colors">
                  {canEditBroadcasts && editingId === b.id ? (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
                        <select
                          value={editCategoryId}
                          onChange={(e) => setEditCategoryId(e.target.value)}
                          className="flex h-9 w-full sm:w-[300px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="">-- No Category --</option>
                          {data?.categories?.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</label>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          disabled={b.type === 'Poll'}
                          className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {b.type === 'Poll' && <p className="text-xs text-muted-foreground">Poll text cannot be modified on Telegram.</p>}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(b.id, b.type === 'Poll')}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-4 disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-4"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                            {b.type}
                          </span>
                          {b.category && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors border-border bg-transparent text-muted-foreground">
                              <div className="size-2 rounded-full" style={{ backgroundColor: b.category.color }} />
                              {b.category.name}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">{formatDate(b.createdAt)}</span>
                        </div>
                        <p className="font-medium whitespace-pre-wrap">{b.content}</p>
                      </div>
                      {canEditBroadcasts && (
                        <button
                          onClick={() => handleEditClick(b)}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground/50 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
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
