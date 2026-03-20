"use client";

import { useEffect, useMemo, useState } from "react";
import Link from 'next/link';

type House = {
  chat_id: number;
  title: string;
  status: string;
};

type Category = {
  id: string;
  name: string;
  color: string;
};

export default function ComposePage() {
  const [type, setType] = useState<"message" | "poll">("message");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [mediaUrl, setMediaUrl] = useState("");
  const [houses, setHouses] = useState<House[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedHouseIds, setSelectedHouseIds] = useState<number[]>([]);
  const [loadingHouses, setLoadingHouses] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const applyAnnouncementTemplate = () => {
    setType('message');
    setContent('Reminder: Welfare Pack collection is tomorrow, 10:00 AM to 4:00 PM at MPH. Please bring your matric card for verification.');
    setMediaUrl('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80');
  };

  const applyPollTemplate = () => {
    setType('poll');
    setContent('Interest Check: Which timeslot works best for the Inter-House Networking Session next Friday?');
    setOptions(['6:00 PM - 7:30 PM', '7:30 PM - 9:00 PM', 'I cannot attend']);
  };

  const activeHouses = useMemo(
    () => houses.filter((house) => house.status === 'active'),
    [houses]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoadingHouses(true);
      setLoadingCategories(true);
      try {
        const [housesRes, categoriesRes] = await Promise.all([
          fetch('/api/houses', { signal: controller.signal, cache: 'no-store' }),
          fetch('/api/categories', { signal: controller.signal, cache: 'no-store' })
        ]);

        const housesData = await housesRes.json();
        if (!housesRes.ok) throw new Error(housesData.error || 'Failed to load houses');
        setHouses(housesData.houses ?? []);

        const categoriesData = await categoriesRes.json();
        if (categoriesRes.ok) setCategories(categoriesData.categories ?? []);

      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          setError((fetchError as Error).message || 'Failed to load dependencies');
        }
      } finally {
        setLoadingHouses(false);
        setLoadingCategories(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, []);
  
  const addOption = () => setOptions([...options, ""]);
  const updateOption = (index: number, val: string) => {
    const newOptions = [...options];
    newOptions[index] = val;
    setOptions(newOptions);
  };

  const toggleHouse = (chatId: number) => {
    setSelectedHouseIds((current) =>
      current.includes(chatId) ? current.filter((id) => id !== chatId) : [...current, chatId]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setResultMessage(null);

    try {
      const cleanOptions = options.map((option) => option.trim()).filter(Boolean);

      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          content,
          options: type === 'poll' ? cleanOptions : undefined,
          mediaUrl: type === 'message' ? mediaUrl : undefined,
          categoryId: categoryId || undefined,
          sendToAll,
          houseChatIds: sendToAll ? undefined : selectedHouseIds,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send broadcast');
      }

      setResultMessage(
        `Sent to ${data.sentCount} house chat${data.sentCount === 1 ? '' : 's'}${
          data.failedCount ? ` (${data.failedCount} failed)` : ''
        }.`
      );
      setContent('');
      setMediaUrl('');
      setOptions(['', '']);
      setCategoryId('');
    } catch (submitError) {
      setError((submitError as Error).message || 'Failed to send broadcast');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    content.trim().length > 0 &&
    (type === 'message' || options.map((option) => option.trim()).filter(Boolean).length >= 2) &&
    (sendToAll || selectedHouseIds.length > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Broadcast</h1>
            <p className="text-muted-foreground mt-1">Send an announcement or poll to all connected House Chats.</p>
          </div>
          <Link href="/settings/categories" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            Manage Categories
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={applyAnnouncementTemplate}
            className="inline-flex items-center rounded-md border border-input px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            Use Announcement Template
          </button>
          <button
            onClick={applyPollTemplate}
            className="inline-flex items-center rounded-md border border-input px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
          >
            Use Poll Template
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="flex border-b border-border bg-secondary/30">
          <button 
            onClick={() => setType("message")}
            className={`flex-1 ${type === "message" ? "scale-100" : "scale-95 opacity-80"} py-3 text-sm font-medium transition-all duration-300 ${type === "message" ? "border-b-2 border-primary text-foreground bg-secondary/10" : "text-muted-foreground hover:text-foreground"}`}
          >
            Announcement
          </button>
          <button 
            onClick={() => setType("poll")}
            className={`flex-1 ${type === "poll" ? "scale-100" : "scale-95 opacity-80"} py-3 text-sm font-medium transition-all duration-300 ${type === "poll" ? "border-b-2 border-primary text-foreground bg-secondary/10" : "text-muted-foreground hover:text-foreground"}`}
          >
            Interest-Check Poll
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium leading-none">Target House Chats</label>
            <div className="rounded-md border border-input p-3 space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(event) => setSendToAll(event.target.checked)}
                  className="size-4 rounded border border-input bg-transparent"
                />
                Send to all active house chats
              </label>

              {!sendToAll && (
                <div className="max-h-44 overflow-auto rounded border border-border divide-y divide-border">
                  {activeHouses.map((house) => (
                    <label key={house.chat_id} className="flex items-center gap-2 p-2 text-sm hover:bg-secondary/30">
                      <input
                        type="checkbox"
                        checked={selectedHouseIds.includes(house.chat_id)}
                        onChange={() => toggleHouse(house.chat_id)}
                        className="size-4 rounded border border-input bg-transparent"
                      />
                      <span>{house.title}</span>
                    </label>
                  ))}
                  {!loadingHouses && activeHouses.length === 0 && (
                    <p className="text-sm text-muted-foreground p-2">No active house chats found.</p>
                  )}
                </div>
              )}

              {loadingHouses && <p className="text-xs text-muted-foreground">Loading house chats...</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Category (Optional)</label>
            <div className="relative">
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                disabled={loadingCategories}
                className="flex h-10 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors hover:border-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- No Category --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {type === "message" ? "Message Content" : "Poll Question"}
            </label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex min-h-30 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:border-muted-foreground/50 transition-colors disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder={type === "message" ? "e.g. Reminder: Welfare Pack collection is tomorrow at MPH, 10:00 AM to 4:00 PM." : "e.g. Which timeslot works best for Friday's Inter-House Networking Session?"}
            />
          </div>

          {type === "poll" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 fill-mode-both">
              <label className="text-sm font-medium leading-none">Poll Options</label>
              <div className="space-y-3">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2 isolate relative animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                    <input 
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors hover:border-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={`Option ${i + 1} (e.g. 7:30 PM - 9:00 PM)`}
                    />
                  </div>
                ))}
              </div>
              <button 
                onClick={addOption}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-muted-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add Option
              </button>
            </div>
          )}

          {type === "message" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-medium leading-none">Image URL (Optional)</label>
              <input
                value={mediaUrl}
                onChange={(event) => setMediaUrl(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors hover:border-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="https://example.com/welfare-pack-poster.jpg"
              />
              <p className="text-xs text-muted-foreground">Provide a publicly accessible image URL for infographic broadcasts.</p>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
              {error}
            </div>
          )}

          {resultMessage && (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-200">
              {resultMessage}
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex items-center justify-end border-t border-border bg-secondary/10">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting || loadingHouses}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] h-9 px-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            {submitting ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </div>
    </div>
  );
}
