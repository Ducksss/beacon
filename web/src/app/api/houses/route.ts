import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isMissingTableError, missingSchemaMessage } from '@/lib/supabase-errors';
import { getPublicDemoPrivateMetadataResponse } from '@/lib/public-demo-server';

export async function GET() {
  try {
    const publicDemoResponse = getPublicDemoPrivateMetadataResponse();
    if (publicDemoResponse) {
      return publicDemoResponse;
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
