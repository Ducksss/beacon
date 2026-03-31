type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

type TelegramSendMessageResult = {
  message_id: number;
};

type TelegramSendPollResult = {
  message_id: number;
  poll: {
    id: string;
  };
};

type TelegramWebhookInfoResult = {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
};

type TelegramUpdateResult<T> = T[];

export type TelegramUpdate = {
  update_id: number;
  my_chat_member?: {
    chat: {
      id: number;
      title?: string;
    };
    new_chat_member: {
      status: string;
    };
  };
  poll_answer?: {
    poll_id: string;
    user: {
      id: number;
    };
    option_ids?: number[];
  };
};

function requireBotToken(botToken?: string): string {
  const token = botToken ?? process.env.TELEGRAM_BOT_TOKEN;
  if (!token?.trim()) {
    throw new Error('Missing required Telegram bot token');
  }
  return token.trim();
}

function getTelegramApiBase(botToken?: string): string {
  const token = requireBotToken(botToken);
  return `https://api.telegram.org/bot${token}`;
}

async function telegramPost<T>(
  method: string,
  payload: Record<string, unknown>,
  botToken?: string
): Promise<TelegramApiResponse<T>> {
  const response = await fetch(`${getTelegramApiBase(botToken)}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as TelegramApiResponse<T>;
  if (!response.ok || !data.ok) {
    throw new Error(data.description || `Telegram API request failed: ${method}`);
  }

  return data;
}

export function createTelegramClient(botToken: string) {
  const token = requireBotToken(botToken);

  return {
    sendMessage(chatId: string | number, text: string) {
      return telegramPost<TelegramSendMessageResult>('sendMessage', {
        chat_id: chatId,
        text,
      }, token);
    },
    sendPhoto(chatId: string | number, photoUrl: string, caption?: string) {
      return telegramPost<TelegramSendMessageResult>('sendPhoto', {
        chat_id: chatId,
        photo: photoUrl,
        caption,
      }, token);
    },
    sendPoll(chatId: string | number, question: string, options: string[], isAnonymous = false) {
      return telegramPost<TelegramSendPollResult>('sendPoll', {
        chat_id: chatId,
        question,
        options,
        is_anonymous: isAnonymous,
        allows_multiple_answers: false,
      }, token);
    },
    setWebhook(url: string) {
      return telegramPost<boolean>('setWebhook', { url }, token);
    },
    getWebhookInfo() {
      return telegramPost<TelegramWebhookInfoResult>('getWebhookInfo', {}, token);
    },
    getUpdates(offset?: number, limit = 100) {
      const payload: Record<string, unknown> = {
        limit,
        allowed_updates: ['my_chat_member', 'poll_answer'],
      };

      if (typeof offset === 'number') {
        payload.offset = offset;
      }

      return telegramPost<TelegramUpdateResult<TelegramUpdate>>('getUpdates', payload, token);
    },
    editMessageText(chatId: string | number, messageId: number, text: string) {
      return telegramPost<boolean | TelegramSendMessageResult>('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
      }, token);
    },
    editMessageCaption(chatId: string | number, messageId: number, caption: string) {
      return telegramPost<boolean | TelegramSendMessageResult>('editMessageCaption', {
        chat_id: chatId,
        message_id: messageId,
        caption,
      }, token);
    },
  };
}

function getDefaultTelegramClient() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('Missing required environment variable: TELEGRAM_BOT_TOKEN');
  }
  return createTelegramClient(botToken);
}

export async function sendMessage(chatId: string | number, text: string) {
  return getDefaultTelegramClient().sendMessage(chatId, text);
}

export async function sendPhoto(chatId: string | number, photoUrl: string, caption?: string) {
  return getDefaultTelegramClient().sendPhoto(chatId, photoUrl, caption);
}

export async function sendPoll(chatId: string | number, question: string, options: string[], isAnonymous = false) {
  return getDefaultTelegramClient().sendPoll(chatId, question, options, isAnonymous);
}

export async function setWebhook(url: string) {
  return getDefaultTelegramClient().setWebhook(url);
}

export async function getWebhookInfo() {
  return getDefaultTelegramClient().getWebhookInfo();
}

export async function getUpdates(offset?: number, limit = 100) {
  return getDefaultTelegramClient().getUpdates(offset, limit);
}

export async function editMessageText(chatId: string | number, messageId: number, text: string) {
  return getDefaultTelegramClient().editMessageText(chatId, messageId, text);
}

export async function editMessageCaption(chatId: string | number, messageId: number, caption: string) {
  return getDefaultTelegramClient().editMessageCaption(chatId, messageId, caption);
}
