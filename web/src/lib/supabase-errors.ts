type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

function asSupabaseError(error: unknown): SupabaseErrorLike {
  if (!error || typeof error !== 'object') {
    return {};
  }

  return error as SupabaseErrorLike;
}

export function isMissingTableError(error: unknown): boolean {
  const supabaseError = asSupabaseError(error);
  return supabaseError.code === 'PGRST205';
}

export function missingSchemaMessage(): string {
  return 'Database schema is not initialized. Run web/supabase/schema.sql in your Supabase SQL editor.';
}
