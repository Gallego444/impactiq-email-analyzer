import { google, type gmail_v1 } from "googleapis";
import type { EmailItem } from "@/lib/types";
import { toGmailQueryDates } from "@/lib/date-range";

function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string
): string {
  const found = headers?.find(
    (h) => h.name?.toLowerCase() === name.toLowerCase()
  );
  return found?.value ?? "";
}

function parseMessage(message: gmail_v1.Schema$Message): EmailItem {
  const headers = message.payload?.headers;
  const subject = getHeader(headers, "Subject") || "(Sin asunto)";
  const from = getHeader(headers, "From") || "Desconocido";
  const dateHeader = getHeader(headers, "Date");
  const date = message.internalDate
    ? new Date(Number(message.internalDate)).toISOString()
    : dateHeader || new Date().toISOString();

  return {
    id: message.id ?? "",
    subject,
    from,
    date,
    snippet: message.snippet ?? "",
  };
}

export async function fetchGmailMessages(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<{ emails: EmailItem[]; total: number }> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const { after, before } = toGmailQueryDates(startDate, endDate);
  const query = `after:${after} before:${before}`;

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 50,
  });

  const messageIds = listResponse.data.messages ?? [];
  const total = messageIds.length;

  if (total === 0) {
    return { emails: [], total: 0 };
  }

  const emails: EmailItem[] = [];

  for (const item of messageIds) {
    if (!item.id) continue;

    const detail = await gmail.users.messages.get({
      userId: "me",
      id: item.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From", "Date"],
    });

    if (detail.data) {
      emails.push(parseMessage(detail.data));
    }
  }

  return { emails, total };
}
