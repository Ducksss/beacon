"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

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
  return date.toLocaleString();
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
  const showDemoContent = !loading && !error && !hasLiveContent;

  const stats = [
    { label: 'Active Houses', value: String(showDemoContent ? demoStats.activeHouses : data?.stats.activeHouses ?? 0) },
    { label: 'Students Reached', value: String(showDemoContent ? demoStats.studentsReached : data?.stats.studentsReached ?? 0) },
    { label: 'Recent Poll Responses', value: String(showDemoContent ? demoStats.recentPollResponses : data?.stats.recentPollResponses ?? 0) },
  ];

  const handleEditClick = (broadcast: any) => {
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
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor your central outreach and engagement.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            href="/settings/categories" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Manage Categories
          </Link>
          <Link 
            href="/compose" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            New Broadcast
          </Link>
        </div>
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
                  {editingId === b.id ? (
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
                      <button
                        onClick={() => handleEditClick(b)}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground/50 transition-colors"
                      >
                        Edit
                      </button>
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
