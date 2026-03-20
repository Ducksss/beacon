import { NextResponse } from 'next/server';
import { tryGetSupabaseAdmin } from '@/lib/supabase';
import { isMissingTableError, missingSchemaMessage } from '@/lib/supabase-errors';

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
  option_index: number;
  text: string;
};

type TelegramPollInstanceRow = {
  telegram_poll_id: string;
};

type VoteRow = {
  option_index: number;
};

export async function GET() {
  try {
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

    const [
      { data: houses, error: housesError },
      { data: broadcasts, error: broadcastsError },
      { data: votesByUser, error: votesByUserError },
      { count: totalResponses, error: totalResponsesError },
      { data: categories, error: categoriesError }
    ] = await Promise.all([
      supabase.from('houses').select('chat_id,title,status').eq('status', 'active').order('title', { ascending: true }),
      supabase.from('broadcasts').select('id,content,media_url,created_at,category_id,categories(id,name,color)').order('created_at', { ascending: false }).limit(20),
      supabase.from('votes').select('user_id'),
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (housesError) throw housesError;
    if (broadcastsError) throw broadcastsError;
    if (votesByUserError) throw votesByUserError;
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

    const recentBroadcasts = broadcastRows.map((item) => ({
      id: item.id,
      content: item.content || 'Untitled broadcast',
      mediaUrl: item.media_url,
      createdAt: item.created_at,
      category: Array.isArray(item.categories) ? item.categories[0] : (item.categories || null),
      type: pollByBroadcastId.has(item.id) ? 'Poll' : 'Announcement',
    }));

    const pollSummaries = await Promise.all(
      pollRows.slice(0, 5).map(async (poll) => {
        const [{ data: options, error: optionsError }, { data: telegramPolls, error: telegramPollsError }] = await Promise.all([
          supabase.from('poll_options').select('option_index,text').eq('poll_id', poll.id).order('option_index', { ascending: true }),
          supabase.from('telegram_polls').select('telegram_poll_id').eq('master_poll_id', poll.id),
        ]);

        if (optionsError) throw optionsError;
        if (telegramPollsError) throw telegramPollsError;

        const telegramPollIds = ((telegramPolls ?? []) as TelegramPollInstanceRow[]).map((item) => item.telegram_poll_id);
        const { data: votes, error: votesError } = telegramPollIds.length
          ? await supabase.from('votes').select('option_index').in('telegram_poll_id', telegramPollIds)
          : { data: [], error: null };

        if (votesError) throw votesError;

        const counts = new Map<number, number>();
        for (const vote of (votes ?? []) as VoteRow[]) {
          counts.set(vote.option_index, (counts.get(vote.option_index) ?? 0) + 1);
        }

        const optionsWithVotes = ((options ?? []) as PollOptionRow[]).map((option) => ({
          optionIndex: option.option_index,
          text: option.text,
          votes: counts.get(option.option_index) ?? 0,
        }));

        const leading = [...optionsWithVotes].sort((a, b) => b.votes - a.votes)[0];

        return {
          pollId: poll.id,
          question: poll.question,
          totalVotes: optionsWithVotes.reduce((sum, option) => sum + option.votes, 0),
          leadingOption: leading ? { text: leading.text, votes: leading.votes } : null,
          options: optionsWithVotes,
        };
      })
    );

    const uniqueVoters = new Set((votesByUser ?? []).map((row) => String(row.user_id))).size;

    return NextResponse.json({
      stats: {
        activeHouses: (houses ?? []).length,
        studentsReached: uniqueVoters,
        recentPollResponses: totalResponses ?? 0,
      },
      activeHouses: houses ?? [],
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
