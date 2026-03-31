import { NextResponse } from 'next/server';
import { tryGetSupabaseAdmin } from '@/lib/supabase';
import { isMissingTableError, missingSchemaMessage } from '@/lib/supabase-errors';
import { isPublicDemoMode } from '@/lib/public-demo';
import { syncPendingTelegramUpdates } from '@/lib/telegram-updates';

type BroadcastRow = {
  id: string;
  content: string | null;
  media_url: string | null;
  created_at: string;
  category_id?: string | null;
  categories?: { id: string; name: string; color: string; } | { id: string; name: string; color: string; }[] | null;
};

type PollRow = {
  id: string;
  broadcast_id: string;
  question: string;
  created_at: string;
};

type PollOptionRow = {
  poll_id: string;
  option_index: number;
  text: string;
};

type TelegramPollInstanceRow = {
  master_poll_id: string;
  telegram_poll_id: string;
};

type VoteRow = {
  id: string;
  telegram_poll_id: string;
  option_index: number;
};

type VoteUserRow = {
  user_id: number;
};

const DASHBOARD_BATCH_SIZE = 1000;

function buildVoteKey(pollId: string, optionIndex: number): string {
  return `${pollId}:${optionIndex}`;
}

async function countUniqueVoters(
  supabase: NonNullable<ReturnType<typeof tryGetSupabaseAdmin>>
): Promise<number> {
  let uniqueVoters = 0;
  let lastSeenUserId: number | null = null;

  while (true) {
    let query = supabase
      .from('votes')
      .select('user_id')
      .order('user_id', { ascending: true })
      .limit(DASHBOARD_BATCH_SIZE);

    if (lastSeenUserId !== null) {
      query = query.gt('user_id', lastSeenUserId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const rows = (data ?? []) as VoteUserRow[];
    if (rows.length === 0) {
      return uniqueVoters;
    }

    let pageLastUserId: number | null = lastSeenUserId;
    for (const row of rows) {
      if (row.user_id !== pageLastUserId) {
        uniqueVoters += 1;
        pageLastUserId = row.user_id;
      }
    }

    lastSeenUserId = pageLastUserId;

    if (rows.length < DASHBOARD_BATCH_SIZE) {
      return uniqueVoters;
    }
  }
}

async function countRecentPollVotes(
  supabase: NonNullable<ReturnType<typeof tryGetSupabaseAdmin>>,
  pollIds: string[]
): Promise<Map<string, number>> {
  if (pollIds.length === 0) {
    return new Map();
  }

  const { data: telegramPolls, error: telegramPollsError } = await supabase
    .from('telegram_polls')
    .select('master_poll_id,telegram_poll_id')
    .in('master_poll_id', pollIds);

  if (telegramPollsError) {
    throw telegramPollsError;
  }

  const telegramPollRows = (telegramPolls ?? []) as TelegramPollInstanceRow[];
  if (telegramPollRows.length === 0) {
    return new Map();
  }

  const telegramPollIds = telegramPollRows.map((row) => row.telegram_poll_id);
  const masterPollIdByTelegramPollId = new Map(
    telegramPollRows.map((row) => [row.telegram_poll_id, row.master_poll_id])
  );
  const counts = new Map<string, number>();
  let lastSeenVoteId: string | null = null;

  while (true) {
    let query = supabase
      .from('votes')
      .select('id,telegram_poll_id,option_index')
      .in('telegram_poll_id', telegramPollIds)
      .order('id', { ascending: true })
      .limit(DASHBOARD_BATCH_SIZE);

    if (lastSeenVoteId !== null) {
      query = query.gt('id', lastSeenVoteId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    const rows = (data ?? []) as VoteRow[];
    if (rows.length === 0) {
      return counts;
    }

    for (const row of rows) {
      const masterPollId = masterPollIdByTelegramPollId.get(row.telegram_poll_id);
      if (!masterPollId) {
        continue;
      }

      const key = buildVoteKey(masterPollId, row.option_index);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    lastSeenVoteId = rows[rows.length - 1]?.id ?? null;
    if (rows.length < DASHBOARD_BATCH_SIZE) {
      return counts;
    }
  }
}

export async function GET() {
  try {
    const publicDemoMode = isPublicDemoMode();
    const supabase = tryGetSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({
        stats: {
          activeHouses: 0,
          studentsReached: 0,
          recentPollResponses: 0,
        },
        activeHouses: [],
        recentBroadcasts: [],
        pollSummaries: [],
        warning: 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      });
    }

    if (!publicDemoMode) {
      try {
        await syncPendingTelegramUpdates(supabase);
      } catch (syncError) {
        console.warn('Failed to sync pending Telegram updates:', syncError);
      }
    }

    const [
      { data: houses, error: housesError },
      { data: broadcasts, error: broadcastsError },
      { count: totalResponses, error: totalResponsesError },
      { data: categories, error: categoriesError }
    ] = await Promise.all([
      supabase.from('houses').select('chat_id,title,status').eq('status', 'active').order('title', { ascending: true }),
      supabase.from('broadcasts').select('id,content,media_url,created_at,category_id,categories(id,name,color)').order('created_at', { ascending: false }).limit(20),
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (housesError) throw housesError;
    if (broadcastsError) throw broadcastsError;
    if (totalResponsesError) throw totalResponsesError;
    if (categoriesError) throw categoriesError;

    const broadcastRows = (broadcasts ?? []) as BroadcastRow[];
    const broadcastIds = broadcastRows.map((item) => item.id);

    const { data: polls, error: pollsError } = broadcastIds.length
      ? await supabase
          .from('polls')
          .select('id,broadcast_id,question,created_at')
          .in('broadcast_id', broadcastIds)
          .order('created_at', { ascending: false })
      : { data: [], error: null };

    if (pollsError) throw pollsError;

    const pollRows = (polls ?? []) as PollRow[];
    const pollByBroadcastId = new Map(pollRows.map((poll) => [poll.broadcast_id, poll]));
    const recentPollRows = pollRows.slice(0, 5);
    const recentPollIds = recentPollRows.map((poll) => poll.id);

    const recentBroadcasts = broadcastRows.map((item) => ({
      id: item.id,
      content: item.content || 'Untitled broadcast',
      mediaUrl: item.media_url,
      createdAt: item.created_at,
      category: Array.isArray(item.categories) ? item.categories[0] : (item.categories || null),
      type: pollByBroadcastId.has(item.id) ? 'Poll' : 'Announcement',
    }));

    const [{ data: options, error: optionsError }, uniqueVoters, voteCounts] = await Promise.all([
      recentPollIds.length
        ? supabase
            .from('poll_options')
            .select('poll_id,option_index,text')
            .in('poll_id', recentPollIds)
            .order('option_index', { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      countUniqueVoters(supabase),
      countRecentPollVotes(supabase, recentPollIds),
    ]);

    if (optionsError) throw optionsError;

    const optionsByPollId = new Map<string, PollOptionRow[]>();
    for (const option of (options ?? []) as PollOptionRow[]) {
      const pollOptions = optionsByPollId.get(option.poll_id);
      if (pollOptions) {
        pollOptions.push(option);
      } else {
        optionsByPollId.set(option.poll_id, [option]);
      }
    }

    const pollSummaries = recentPollRows.map((poll) => {
      const optionsWithVotes = (optionsByPollId.get(poll.id) ?? []).map((option) => ({
        optionIndex: option.option_index,
        text: option.text,
        votes: voteCounts.get(buildVoteKey(poll.id, option.option_index)) ?? 0,
      }));

      const leading = optionsWithVotes.reduce<(typeof optionsWithVotes)[number] | null>(
        (currentLeading, option) => {
          if (!currentLeading || option.votes > currentLeading.votes) {
            return option;
          }
          return currentLeading;
        },
        null
      );

      return {
        pollId: poll.id,
        question: poll.question,
        totalVotes: optionsWithVotes.reduce((sum, option) => sum + option.votes, 0),
        leadingOption: leading ? { text: leading.text, votes: leading.votes } : null,
        options: optionsWithVotes,
      };
    });

    return NextResponse.json({
      stats: {
        activeHouses: (houses ?? []).length,
        studentsReached: uniqueVoters,
        recentPollResponses: totalResponses ?? 0,
      },
      activeHouses: publicDemoMode ? [] : (houses ?? []),
      recentBroadcasts,
      pollSummaries,
      categories: categories ?? [],
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({
        stats: {
          activeHouses: 0,
          studentsReached: 0,
          recentPollResponses: 0,
        },
        activeHouses: [],
        categories: [],
        recentBroadcasts: [],
        pollSummaries: [],
        warning: missingSchemaMessage(),
      });
    }

    console.error('Failed to build dashboard data:', error);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
