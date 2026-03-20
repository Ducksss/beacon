import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendMessage } from '@/lib/telegram';
import { isMissingTableError } from '@/lib/supabase-errors';

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const update = await request.json();
    
    // 1. Handle Bot being added to or removed from a House Chat
    if (update.my_chat_member) {
      const chat = update.my_chat_member.chat;
      const newStatus = update.my_chat_member.new_chat_member.status;
      
      if (newStatus === 'administrator' || newStatus === 'member') {
        // The bot was added, register the house
        await supabase.from('houses').upsert({
          chat_id: chat.id,
          title: chat.title || 'Unknown Group',
          status: 'active'
        });
        await sendMessage(chat.id, "Hello! Beacon is now active in your house chat. I'll forward important announcements here.");
      } else if (newStatus === 'kicked' || newStatus === 'left') {
        // The bot was removed
        await supabase.from('houses').update({ status: 'inactive' }).eq('chat_id', chat.id);
      }
    }

    // 2. Handle Poll Votes (Interactions)
    if (update.poll_answer) {
      const answer = update.poll_answer;

      // Clear prior vote, then persist latest answer for single-choice polls.
      await supabase
        .from('votes')
        .delete()
        .eq('telegram_poll_id', answer.poll_id)
        .eq('user_id', answer.user.id);

      const selectedOptionIndex = answer.option_ids?.[0];
      if (typeof selectedOptionIndex === 'number') {
        await supabase.from('votes').insert({
          telegram_poll_id: answer.poll_id,
          user_id: answer.user.id,
          option_index: selectedOptionIndex,
        });
      }
    }

    // Acknowledge the webhook correctly so Telegram stops retrying
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ ok: true, warning: 'Database schema not initialized yet' }, { status: 200 });
    }

    console.error("Webhook Error:", error);
    // Return 200 even on error, so Telegram doesn't retry infinitely during development
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 200 });
  }
}
