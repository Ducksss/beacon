import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isPublicDemoMode } from '@/lib/public-demo';
import { isMissingTableError } from '@/lib/supabase-errors';
import { processTelegramUpdate } from '@/lib/telegram-updates';

export async function POST(request: Request) {
  try {
    if (isPublicDemoMode()) {
      // Keep the seeded public demo dataset stable even if a shared webhook is configured.
      return NextResponse.json({ ok: true, ignored: 'public demo mode' });
    }

    const supabase = getSupabaseAdmin();
    const update = await request.json();

    await processTelegramUpdate(update, supabase);

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
