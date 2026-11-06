import type { AppRole } from '@/hooks/useRole';

export type ChatRow = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type ParsedChatContent = {
  channelId: string;
  role: AppRole | null;
  intent: 'request' | 'donate' | 'help' | null;
  text: string;
};

export function parseChatContent(content: string): ParsedChatContent {
  const match = content.match(/^\[([^\]]+)\]\s*/);
  if (!match) return { channelId: 'all', role: null, intent: null, text: content };

  const [channelId, role, intent] = match[1].split('|');
  return {
    channelId: channelId || 'all',
    role: role as AppRole || null,
    intent: intent as ParsedChatContent['intent'] || null,
    text: content.slice(match[0].length),
  };
}

export function channelAllowsRole(channelId: string, role: AppRole): boolean {
  if (role === 'admin') return ['all', 'donor-ngo', 'donor-orphan', 'ngo-orphan'].includes(channelId);
  if (channelId === 'all') return true;
  if (channelId === 'donor-ngo') return role === 'donor' || role === 'ngo';
  if (channelId === 'donor-orphan') return role === 'donor' || role === 'orphanage_member';
  if (channelId === 'ngo-orphan') return role === 'ngo' || role === 'orphanage_member';
  return false;
}

export function uniqueChatRows(rows: ChatRow[]): ChatRow[] {
  const unique = new Map<string, ChatRow>();
  for (const row of rows) {
    const key = `${row.sender_id}:${row.created_at}:${row.content}`;
    if (!unique.has(key)) unique.set(key, row);
  }
  return [...unique.values()].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
}