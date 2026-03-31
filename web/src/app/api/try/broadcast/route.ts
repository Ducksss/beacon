import { NextResponse } from 'next/server';
import { createTelegramClient } from '@/lib/telegram';
import {
  getRejectedErrorMessages,
  normalizePollOptions,
} from '@/lib/broadcast-utils';

type PlaygroundBroadcastType = 'message' | 'poll';

type PlaygroundPayload = {
  botToken: string;
  type: PlaygroundBroadcastType;
  content: string;
  chatIds: string[];
  mediaUrl?: string;
  options?: string[];
};

type RateLimitEntry = {
  deliveries: number;
  resetAt: number;
};

const PLAYGROUND_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const PLAYGROUND_RATE_LIMIT_MAX_DELIVERIES = 30;

const playgroundRateLimitStore =
  globalThis as typeof globalThis & {
    __beaconPlaygroundRateLimit?: Map<string, RateLimitEntry>;
  };

function getPlaygroundRateLimitMap(): Map<string, RateLimitEntry> {
  if (!playgroundRateLimitStore.__beaconPlaygroundRateLimit) {
    playgroundRateLimitStore.__beaconPlaygroundRateLimit = new Map();
  }

  return playgroundRateLimitStore.__beaconPlaygroundRateLimit;
}

function isValidChatId(value: string): boolean {
  return /^-?\d+$/.test(value.trim());
}

function normalizeChatIds(chatIds: unknown): string[] {
  if (!Array.isArray(chatIds)) {
    return [];
  }

  return [...new Set(
    chatIds
      .map((chatId) => String(chatId).trim())
      .filter((chatId) => chatId.length > 0 && isValidChatId(chatId))
  )];
}

function validateMediaUrl(mediaUrl?: string): string | null {
  if (!mediaUrl?.trim()) {
    return null;
  }

  try {
    const parsed = new URL(mediaUrl.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'Media URL must use http or https';
    }
    return null;
  } catch {
    return 'Media URL must be a valid URL';
  }
}

function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const clientIp = forwardedFor.split(',')[0]?.trim();
    if (clientIp) {
      return `ip:${clientIp}`;
    }
  }

  const directIp =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip');

  if (directIp?.trim()) {
    return `ip:${directIp.trim()}`;
  }

  const userAgent = request.headers.get('user-agent')?.trim();
  return userAgent ? `ua:${userAgent}` : 'anonymous';
}

function enforceRateLimit(request: Request, deliveryCount: number): string | null {
  const identifier = getClientIdentifier(request);
  const now = Date.now();
  const rateLimitMap = getPlaygroundRateLimitMap();

  for (const [key, entry] of rateLimitMap) {
    if (entry.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }

  const currentEntry = rateLimitMap.get(identifier);
  const activeEntry =
    currentEntry && currentEntry.resetAt > now
      ? currentEntry
      : { deliveries: 0, resetAt: now + PLAYGROUND_RATE_LIMIT_WINDOW_MS };

  if (activeEntry.deliveries + deliveryCount > PLAYGROUND_RATE_LIMIT_MAX_DELIVERIES) {
    const retryAfterMinutes = Math.ceil((activeEntry.resetAt - now) / 60000);
    return `Rate limit exceeded for the public playground. Please wait about ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? '' : 's'} before sending more test messages.`;
  }

  rateLimitMap.set(identifier, {
    deliveries: activeEntry.deliveries + deliveryCount,
    resetAt: activeEntry.resetAt,
  });

  return null;
}

function validatePayload(payload: PlaygroundPayload): string | null {
  const chatIds = normalizeChatIds(payload.chatIds);

  if (!payload.botToken?.trim()) {
    return 'Telegram bot token is required';
  }

  if (payload.type !== 'message' && payload.type !== 'poll') {
    return 'Invalid broadcast type';
  }

  if (!payload.content?.trim()) {
    return payload.type === 'poll' ? 'Poll question is required' : 'Announcement content is required';
  }

  if (chatIds.length === 0) {
    return 'At least one valid Telegram chat ID is required';
  }

  if (chatIds.length > 10) {
    return 'Please limit each test run to 10 chat IDs';
  }

  const mediaUrlError = validateMediaUrl(payload.mediaUrl);
  if (mediaUrlError) {
    return mediaUrlError;
  }

  if (payload.type === 'poll') {
    const options = normalizePollOptions(payload.options);
    if (options.length < 2) {
      return 'At least 2 poll options are required';
    }

    if (options.length > 10) {
      return 'Telegram polls support up to 10 options';
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PlaygroundPayload;
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const telegram = createTelegramClient(payload.botToken.trim());
    const chatIds = normalizeChatIds(payload.chatIds);
    const rateLimitError = enforceRateLimit(request, chatIds.length);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError }, { status: 429 });
    }

    const content = payload.content.trim();
    const mediaUrl = payload.mediaUrl?.trim();

    if (payload.type === 'poll') {
      const options = normalizePollOptions(payload.options);
      const results = await Promise.allSettled(
        chatIds.map(async (chatId) => {
          const response = await telegram.sendPoll(chatId, content, options, false);
          return {
            chatId,
            messageId: response.result?.message_id ?? null,
            pollId: response.result?.poll?.id ?? null,
          };
        })
      );

      const successes = results
        .filter((result): result is PromiseFulfilledResult<{ chatId: string; messageId: number | null; pollId: string | null }> => result.status === 'fulfilled')
        .map((result) => result.value);

      const failures = getRejectedErrorMessages(results, 'Unknown Telegram error');

      return NextResponse.json({
        ok: true,
        type: payload.type,
        sentCount: successes.length,
        failedCount: failures.length,
        deliveries: successes,
        failures,
      });
    }

    const results = await Promise.allSettled(
      chatIds.map(async (chatId) => {
        const response = mediaUrl
          ? await telegram.sendPhoto(chatId, mediaUrl, content)
          : await telegram.sendMessage(chatId, content);

        return {
          chatId,
          messageId: response.result?.message_id ?? null,
        };
      })
    );

    const successes = results
      .filter((result): result is PromiseFulfilledResult<{ chatId: string; messageId: number | null }> => result.status === 'fulfilled')
      .map((result) => result.value);

    const failures = getRejectedErrorMessages(results, 'Unknown Telegram error');

    return NextResponse.json({
      ok: true,
      type: payload.type,
      sentCount: successes.length,
      failedCount: failures.length,
      deliveries: successes,
      failures,
    });
  } catch (error) {
    console.error('Playground broadcast error:', error);
    return NextResponse.json({ error: 'Failed to send playground broadcast' }, { status: 500 });
  }
}
