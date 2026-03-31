import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { tryGetSupabaseAdmin } from '@/lib/supabase';
import { isMissingTableError } from '@/lib/supabase-errors';

type RateLimitEntry = {
  deliveries: number;
  resetAt: number;
};

type SharedRateLimitRow =
  Database['public']['Tables']['playground_rate_limits']['Row'];

const PLAYGROUND_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const PLAYGROUND_RATE_LIMIT_MAX_DELIVERIES = 30;

const fallbackRateLimitStore =
  globalThis as typeof globalThis & {
    __beaconPlaygroundRateLimit?: Map<string, RateLimitEntry>;
  };

function getFallbackRateLimitMap(): Map<string, RateLimitEntry> {
  if (!fallbackRateLimitStore.__beaconPlaygroundRateLimit) {
    fallbackRateLimitStore.__beaconPlaygroundRateLimit = new Map();
  }

  return fallbackRateLimitStore.__beaconPlaygroundRateLimit;
}

function getClientIdentifier(request: Request): string {
  const directIp =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip');

  if (directIp?.trim()) {
    return `ip:${directIp.trim()}`;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const clientIp = forwardedFor.split(',')[0]?.trim();
    if (clientIp) {
      return `ip:${clientIp}`;
    }
  }

  const userAgent = request.headers.get('user-agent')?.trim();
  return userAgent ? `ua:${userAgent}` : 'anonymous';
}

function getRetryMessage(resetAtMs: number, nowMs: number): string {
  const retryAfterMinutes = Math.max(
    1,
    Math.ceil((resetAtMs - nowMs) / 60000)
  );

  return `Rate limit exceeded for the public playground. Please wait about ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? '' : 's'} before sending more test messages.`;
}

function enforceFallbackRateLimit(
  identifier: string,
  deliveryCount: number,
  nowMs: number
): string | null {
  const rateLimitMap = getFallbackRateLimitMap();

  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt <= nowMs) {
      rateLimitMap.delete(key);
    }
  }

  const currentEntry = rateLimitMap.get(identifier);
  const activeEntry =
    currentEntry && currentEntry.resetAt > nowMs
      ? currentEntry
      : { deliveries: 0, resetAt: nowMs + PLAYGROUND_RATE_LIMIT_WINDOW_MS };

  if (activeEntry.deliveries + deliveryCount > PLAYGROUND_RATE_LIMIT_MAX_DELIVERIES) {
    return getRetryMessage(activeEntry.resetAt, nowMs);
  }

  rateLimitMap.set(identifier, {
    deliveries: activeEntry.deliveries + deliveryCount,
    resetAt: activeEntry.resetAt,
  });

  return null;
}

async function cleanupExpiredSharedRows(
  supabase: SupabaseClient<Database>,
  nowIso: string
): Promise<boolean> {
  const { error } = await supabase
    .from('playground_rate_limits')
    .delete()
    .lt('reset_at', nowIso);

  if (!error) {
    return true;
  }

  if (isMissingTableError(error)) {
    return false;
  }

  throw error;
}

async function loadSharedRateLimitRow(
  supabase: SupabaseClient<Database>,
  identifier: string
): Promise<SharedRateLimitRow | null | undefined> {
  const { data, error } = await supabase
    .from('playground_rate_limits')
    .select('identifier,deliveries,reset_at,created_at,updated_at')
    .eq('identifier', identifier)
    .maybeSingle();

  if (!error) {
    return data;
  }

  if (isMissingTableError(error)) {
    return undefined;
  }

  throw error;
}

async function persistSharedRateLimitRow(
  supabase: SupabaseClient<Database>,
  row: Database['public']['Tables']['playground_rate_limits']['Insert']
): Promise<boolean> {
  const { error } = await supabase.from('playground_rate_limits').upsert(row);

  if (!error) {
    return true;
  }

  if (isMissingTableError(error)) {
    return false;
  }

  throw error;
}

async function enforceSharedRateLimit(
  supabase: SupabaseClient<Database>,
  identifier: string,
  deliveryCount: number,
  nowMs: number
): Promise<string | null | undefined> {
  const nowIso = new Date(nowMs).toISOString();
  const nextResetMs = nowMs + PLAYGROUND_RATE_LIMIT_WINDOW_MS;

  const cleanedUp = await cleanupExpiredSharedRows(supabase, nowIso);
  if (!cleanedUp) {
    return undefined;
  }

  const existingRow = await loadSharedRateLimitRow(supabase, identifier);
  if (existingRow === undefined) {
    return undefined;
  }

  const existingResetAtMs = existingRow
    ? new Date(existingRow.reset_at).getTime()
    : 0;
  const isActiveWindow = existingRow !== null && existingResetAtMs > nowMs;
  const currentDeliveries = isActiveWindow ? existingRow.deliveries : 0;
  const activeResetAtMs = isActiveWindow ? existingResetAtMs : nextResetMs;

  if (currentDeliveries + deliveryCount > PLAYGROUND_RATE_LIMIT_MAX_DELIVERIES) {
    return getRetryMessage(activeResetAtMs, nowMs);
  }

  const persisted = await persistSharedRateLimitRow(supabase, {
    identifier,
    deliveries: currentDeliveries + deliveryCount,
    reset_at: new Date(activeResetAtMs).toISOString(),
    created_at: existingRow?.created_at ?? nowIso,
    updated_at: nowIso,
  });

  if (!persisted) {
    return undefined;
  }

  return null;
}

export async function enforcePlaygroundRateLimit(
  request: Request,
  deliveryCount: number
): Promise<string | null> {
  const identifier = getClientIdentifier(request);
  const nowMs = Date.now();
  const supabase = tryGetSupabaseAdmin();

  if (supabase) {
    const sharedResult = await enforceSharedRateLimit(
      supabase,
      identifier,
      deliveryCount,
      nowMs
    );

    if (sharedResult !== undefined) {
      return sharedResult;
    }
  }

  return enforceFallbackRateLimit(identifier, deliveryCount, nowMs);
}
