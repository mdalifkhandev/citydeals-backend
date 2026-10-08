export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: string;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export function isExpoPushToken(token?: string | null) {
  return Boolean(token && /^ExponentPushToken\[[^\]]+\]$|^ExpoPushToken\[[^\]]+\]$/.test(token));
}

export async function sendExpoPushMessages(messages: ExpoPushMessage[]) {
  const validMessages = messages.filter((message) => isExpoPushToken(message.to));
  if (validMessages.length === 0) return { sent: 0, skipped: messages.length };

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validMessages),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Expo push failed with ${response.status}: ${body}`);
  }

  return { sent: validMessages.length, skipped: messages.length - validMessages.length };
}
