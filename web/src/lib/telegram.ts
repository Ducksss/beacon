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

export async function editMessageText(chatId: string | number, messageId: number, text: string) {
  return getDefaultTelegramClient().editMessageText(chatId, messageId, text);
}

export async function editMessageCaption(chatId: string | number, messageId: number, caption: string) {
  return getDefaultTelegramClient().editMessageCaption(chatId, messageId, caption);
}
