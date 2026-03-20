import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendMessage, sendPhoto, sendPoll } from '@/lib/telegram';
import { isMissingTableError, missingSchemaMessage } from '@/lib/supabase-errors';

type BroadcastType = 'message' | 'poll';

type BroadcastPayload = {
  type: BroadcastType;
  content: string;
  mediaUrl?: string;
  houseChatIds?: number[];
  sendToAll?: boolean;
  options?: string[];
  categoryId?: string | null;
};

type House = {
  chat_id: number;
  title: string;
};

function asValidChatIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));
}

function validatePayload(payload: BroadcastPayload): string | null {
  if (payload.type !== 'message' && payload.type !== 'poll') {
    return 'Invalid broadcast type';
  }

  if (!payload.content?.trim()) {
    return payload.type === 'poll' ? 'Poll question is required' : 'Announcement content is required';
  }

  if (payload.type === 'poll') {
    const options = (payload.options ?? []).map((option) => option.trim()).filter(Boolean);
    if (options.length < 2) {
      return 'At least 2 poll options are required';
    }

    if (options.length > 10) {
      return 'Telegram polls support up to 10 options';
    }
  }

  return null;
}

async function getTargetHouses(supabase: ReturnType<typeof getSupabaseAdmin>, payload: BroadcastPayload): Promise<House[]> {
  const sendToAll = payload.sendToAll !== false;
  const targetIds = asValidChatIds(payload.houseChatIds);

  let query = supabase.from('houses').select('chat_id,title').eq('status', 'active');

  if (!sendToAll) {
    if (targetIds.length === 0) {
      return [];
    }
    query = query.in('chat_id', targetIds);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data ?? []) as House[];
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BroadcastPayload;
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const targetHouses = await getTargetHouses(supabase, payload);

    if (targetHouses.length === 0) {
      return NextResponse.json({ error: 'No active target houses found' }, { status: 400 });
    }

    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcasts')
      .insert({
        category_id: payload.categoryId || null,
        content: payload.content.trim(),
        media_url: payload.mediaUrl?.trim() || null,
      })
      .select('id,created_at')
      .single();

    if (broadcastError || !broadcast) {
      throw broadcastError ?? new Error('Failed to create broadcast record');
    }

    if (payload.type === 'poll') {
      const options = (payload.options ?? []).map((option) => option.trim()).filter(Boolean);

      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          broadcast_id: broadcast.id,
          question: payload.content.trim(),
        })
        .select('id')
        .single();

      if (pollError || !poll) {
        throw pollError ?? new Error('Failed to create poll record');
      }

      const optionRows = options.map((text, index) => ({
        poll_id: poll.id,
        text,
        option_index: index,
      }));

      const { error: optionError } = await supabase.from('poll_options').insert(optionRows);
      if (optionError) {
        throw optionError;
      }

      const pollResults = await Promise.allSettled(
        targetHouses.map(async (house) => {
          const telegram = await sendPoll(house.chat_id, payload.content.trim(), options, false);
          const telegramPollId = telegram.result?.poll?.id;
          const messageId = telegram.result?.message_id;

          if (!telegramPollId || !messageId) {
            throw new Error(`Missing poll identifiers for chat ${house.chat_id}`);
          }

          const { error: instanceError } = await supabase.from('telegram_polls').insert({
            telegram_poll_id: telegramPollId,
            master_poll_id: poll.id,
            chat_id: house.chat_id,
            message_id: messageId,
          });

          if (instanceError) {
            throw instanceError;
          }

          return house.chat_id;
        })
      );

      const sentCount = pollResults.filter((result) => result.status === 'fulfilled').length;
      const failures = pollResults
        .filter((result) => result.status === 'rejected')
        .map((result) => (result as PromiseRejectedResult).reason?.message || 'Unknown error');

      return NextResponse.json({
        ok: true,
        type: payload.type,
        broadcastId: broadcast.id,
        sentCount,
        failedCount: targetHouses.length - sentCount,
        failures,
      });
    }

    const messageResults = await Promise.allSettled(
      targetHouses.map(async (house) => {
        let telegramRes;
        if (payload.mediaUrl?.trim()) {
          telegramRes = await sendPhoto(house.chat_id, payload.mediaUrl.trim(), payload.content.trim());
        } else {
          telegramRes = await sendMessage(house.chat_id, payload.content.trim());
        }

        const messageId = telegramRes.result?.message_id;
        if (!messageId) {
          throw new Error(`Missing message identifier for chat ${house.chat_id}`);
        }

        const { error: instanceError } = await supabase.from('telegram_messages').insert({
          broadcast_id: broadcast.id,
          chat_id: house.chat_id,
          message_id: messageId,
        });

        if (instanceError) throw instanceError;

        return house.chat_id;
      })
    );

    const sentCount = messageResults.filter((result) => result.status === 'fulfilled').length;
    const failures = messageResults
      .filter((result) => result.status === 'rejected')
      .map((result) => (result as PromiseRejectedResult).reason?.message || 'Unknown error');

    return NextResponse.json({
      ok: true,
      type: payload.type,
      broadcastId: broadcast.id,
      sentCount,
      failedCount: targetHouses.length - sentCount,
      failures,
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ error: missingSchemaMessage() }, { status: 400 });
    }

    console.error('Broadcast API error:', error);
    return NextResponse.json({ error: 'Failed to dispatch broadcast' }, { status: 500 });
  }
}
