import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isMissingTableError, missingSchemaMessage } from '@/lib/supabase-errors';
import {
  isPublicDemoMode,
  PUBLIC_DEMO_PRIVATE_METADATA_MESSAGE,
} from '@/lib/public-demo';

export async function GET() {
  try {
    if (isPublicDemoMode()) {
      return NextResponse.json(
        { error: PUBLIC_DEMO_PRIVATE_METADATA_MESSAGE },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('houses')
      .select('chat_id,title,status,created_at')
      .order('title', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ houses: data ?? [] });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({ houses: [], warning: missingSchemaMessage() });
    }

    console.error('Failed to fetch houses:', error);
    return NextResponse.json({ error: 'Failed to fetch houses' }, { status: 500 });
  }
}
