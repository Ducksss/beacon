import type { SupabaseClient } from '@supabase/supabase-js';
import { getUpdates, getWebhookInfo, sendMessage, type TelegramUpdate } from '@/lib/telegram';

async function handleChatMemberUpdate(
  update: NonNullable<TelegramUpdate['my_chat_member']>,
  supabase: SupabaseClient
) {
  const chat = update.chat;
  const newStatus = update.new_chat_member.status;

  if (newStatus === 'administrator' || newStatus === 'member') {
    await supabase.from('houses').upsert({
      chat_id: chat.id,
      title: chat.title || 'Unknown Group',
      status: 'active',
    });

    await sendMessage(
      chat.id,
      "Hello! Beacon is now active in your house chat. I'll forward important announcements here."
    );
    return;
  }

  if (newStatus === 'kicked' || newStatus === 'left') {
    await supabase.from('houses').update({ status: 'inactive' }).eq('chat_id', chat.id);
  }
}

async function handlePollAnswerUpdate(
  answer: NonNullable<TelegramUpdate['poll_answer']>,
  supabase: SupabaseClient
) {
  await supabase
    .from('votes')
    .delete()
    .eq('telegram_poll_id', answer.poll_id)
    .eq('user_id', answer.user.id);

  const selectedOptionIndex = answer.option_ids?.[0];
  if (typeof selectedOptionIndex !== 'number') {
    return;
  }

  await supabase.from('votes').insert({
    telegram_poll_id: answer.poll_id,
    user_id: answer.user.id,
    option_index: selectedOptionIndex,
  });
}

export async function processTelegramUpdate(
  update: TelegramUpdate,
  supabase: SupabaseClient
) {
  if (update.my_chat_member) {
    await handleChatMemberUpdate(update.my_chat_member, supabase);
  }

  if (update.poll_answer) {
    await handlePollAnswerUpdate(update.poll_answer, supabase);
  }
}

export async function syncPendingTelegramUpdates(supabase: SupabaseClient) {
  const webhookInfo = await getWebhookInfo();
  const webhook = webhookInfo.result;

  if (!webhook || webhook.url) {
    return {
      syncedCount: 0,
      pendingUpdateCount: webhook?.pending_update_count ?? 0,
      usingWebhook: Boolean(webhook?.url),
    };
  }

  if (!webhook.pending_update_count) {
    return {
      syncedCount: 0,
      pendingUpdateCount: 0,
      usingWebhook: false,
    };
  }

  const updatesResponse = await getUpdates(undefined, 100);
  const updates = updatesResponse.result ?? [];

  for (const update of updates) {
    await processTelegramUpdate(update, supabase);
  }

  const highestUpdateId = updates.at(-1)?.update_id;
  if (typeof highestUpdateId === 'number') {
    await getUpdates(highestUpdateId + 1, 1);
  }

  return {
    syncedCount: updates.length,
    pendingUpdateCount: webhook.pending_update_count,
    usingWebhook: false,
  };
}
