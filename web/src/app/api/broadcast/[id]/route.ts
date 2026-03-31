import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { editMessageText, editMessageCaption } from '@/lib/telegram';
import { isPublicDemoMode, PUBLIC_DEMO_READ_ONLY_MESSAGE } from '@/lib/public-demo';

type BroadcastUpdatePayload = {
  categoryId?: string | null;
  content?: string;
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (isPublicDemoMode()) {
      return NextResponse.json({ error: PUBLIC_DEMO_READ_ONLY_MESSAGE }, { status: 403 });
    }

    const { id } = await context.params;
    const body = (await request.json()) as BroadcastUpdatePayload;
    const { categoryId, content } = body;

    if (!id) {
      return NextResponse.json({ error: 'Broadcast ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch current broadcast
    const { data: broadcast, error: fetchError } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !broadcast) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    // 2. Are we updating content?
    const isContentChanging = content !== undefined && content.trim() !== broadcast.content;
    const cleanContent = content?.trim() || broadcast.content;

    if (isContentChanging) {
      // Check if it has telegram_messages (meaning it's a regular announcement)
      const { data: tgMessages, error: tgError } = await supabase
        .from('telegram_messages')
        .select('*')
        .eq('broadcast_id', broadcast.id);

      if (tgError) throw tgError;

      // If there are TG messages, it means it's an announcement. Edit them on Telegram.
      // If it's a poll, we shouldn't edit content because polls are immutable on TG. 
      // But we prevent that on the frontend anyway.
      if (tgMessages && tgMessages.length > 0) {
        await Promise.allSettled(
          tgMessages.map(async (tm) => {
            if (broadcast.media_url) {
              await editMessageCaption(tm.chat_id, tm.message_id, cleanContent);
            } else {
              await editMessageText(tm.chat_id, tm.message_id, cleanContent);
            }
          })
        );

        // Optional: log failures
        // const failed = editResults.filter(r => r.status === 'rejected');
      }
    }

    // 3. Update Supabase
    const updatePayload: { category_id?: string | null; content?: string | null } = {};
    if (categoryId !== undefined) {
      updatePayload.category_id = categoryId || null;
    }
    if (isContentChanging) {
      updatePayload.content = cleanContent;
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabase
        .from('broadcasts')
        .update(updatePayload)
        .eq('id', broadcast.id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Failed to update broadcast:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
