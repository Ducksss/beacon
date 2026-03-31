import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getPublicDemoReadOnlyResponse } from '@/lib/public-demo-server';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected server error';
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ categories });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const publicDemoResponse = getPublicDemoReadOnlyResponse();
    if (publicDemoResponse) {
      return publicDemoResponse;
    }

    const { name, color } = await request.json();
    if (!name || !color) {
      return NextResponse.json({ error: 'Name and color are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: category, error } = await supabase
      .from('categories')
      .insert({ name, color })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ category });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const publicDemoResponse = getPublicDemoReadOnlyResponse();
    if (publicDemoResponse) {
      return publicDemoResponse;
    }

    const { id, name, color } = await request.json();
    if (!id || !name || !color) {
      return NextResponse.json({ error: 'Category ID, name, and color are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: category, error } = await supabase
      .from('categories')
      .update({ name, color })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ category });
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const publicDemoResponse = getPublicDemoReadOnlyResponse();
    if (publicDemoResponse) {
      return publicDemoResponse;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
