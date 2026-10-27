import 'server-only';

import { ensureInboxDb, getPool } from '@/lib/db';
import type { ChatMessage, Conversation } from '@/types';
import { INBOX_SEED } from './inbox-seed';
import { formatDisplayPhone, initialsFromName, toWaId } from './phone';

export type StoredMessage = ChatMessage & {
  metaMessageId?: string;
};

type ConversationRow = {
  id: string;
  contact_id: string;
  wa_id: string;
  name: string;
  phone: string;
  category: string;
  status: Conversation['status'];
  unread_count: number;
  is_online: boolean;
  initials: string;
  avatar_bg: string;
  avatar_color: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender: 'contact' | 'agent';
  body: string;
  display_time: string;
  date_group: 'Yesterday' | 'Today';
  is_template: boolean;
  template_name: string | null;
  status: 'sent' | 'delivered' | 'read' | null;
  meta_message_id: string | null;
};

function ready() {
  return ensureInboxDb(INBOX_SEED);
}

function nowParts() {
  const now = new Date();
  return {
    timestamp: now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    dateGroup: 'Today' as const,
  };
}

function avatarFor(name: string) {
  return {
    initials: initialsFromName(name),
    avatarBg: '#ddf3e5',
    avatarColor: '#0b5c46',
  };
}

function toMessage(row: MessageRow): StoredMessage {
  return {
    id: row.id,
    sender: row.sender,
    text: row.body,
    timestamp: row.display_time,
    dateGroup: row.date_group,
    isTemplate: row.is_template || undefined,
    templateName: row.template_name ?? undefined,
    status: row.status ?? undefined,
    metaMessageId: row.meta_message_id ?? undefined,
  };
}

function toConversation(
  row: ConversationRow,
  messages: StoredMessage[]
): Conversation {
  return {
    id: row.id,
    contactId: row.contact_id,
    name: row.name,
    phone: row.phone,
    category: row.category,
    status: row.status,
    unreadCount: row.unread_count,
    isOnline: row.is_online,
    initials: row.initials,
    avatarBg: row.avatar_bg,
    avatarColor: row.avatar_color,
    messages,
  };
}

async function messagesFor(ids: string[]): Promise<Map<string, StoredMessage[]>> {
  const grouped = new Map<string, StoredMessage[]>();
  if (ids.length === 0) return grouped;
  const { rows } = await getPool().query<MessageRow>(
    `SELECT id, conversation_id, sender, body, display_time, date_group,
            is_template, template_name, status, meta_message_id
     FROM messages
     WHERE conversation_id = ANY($1::text[])
     ORDER BY position`,
    [ids]
  );
  for (const row of rows) {
    const list = grouped.get(row.conversation_id) ?? [];
    list.push(toMessage(row));
    grouped.set(row.conversation_id, list);
  }
  return grouped;
}

async function loadConversation(id: string): Promise<Conversation | null> {
  const { rows } = await getPool().query<ConversationRow>(
    `SELECT id, contact_id, wa_id, name, phone, category, status,
            unread_count, is_online, initials, avatar_bg, avatar_color
     FROM conversations
     WHERE id = $1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  const messages = await messagesFor([row.id]);
  return toConversation(row, messages.get(row.id) ?? []);
}

export async function listConversations(): Promise<Conversation[]> {
  await ready();
  const { rows } = await getPool().query<ConversationRow>(
    `SELECT id, contact_id, wa_id, name, phone, category, status,
            unread_count, is_online, initials, avatar_bg, avatar_color
     FROM conversations
     ORDER BY updated_at DESC`
  );
  const messages = await messagesFor(rows.map((row) => row.id));
  return rows.map((row) => toConversation(row, messages.get(row.id) ?? []));
}

export async function getTotalUnread(): Promise<number> {
  await ready();
  const { rows } = await getPool().query<{ total: string }>(
    'SELECT COALESCE(sum(unread_count), 0)::text AS total FROM conversations'
  );
  return Number(rows[0]?.total ?? 0);
}

export async function getConversation(id: string): Promise<Conversation | null> {
  await ready();
  return loadConversation(id);
}

export async function findConversationByPhone(
  phone: string
): Promise<(Conversation & { waId: string }) | null> {
  await ready();
  const waId = toWaId(phone);
  if (!waId) return null;
  const { rows } = await getPool().query<ConversationRow>(
    `SELECT id, contact_id, wa_id, name, phone, category, status,
            unread_count, is_online, initials, avatar_bg, avatar_color
     FROM conversations
     WHERE wa_id = $1
     LIMIT 1`,
    [waId]
  );
  const row = rows[0];
  if (!row) return null;
  const messages = await messagesFor([row.id]);
  return {
    ...toConversation(row, messages.get(row.id) ?? []),
    waId: row.wa_id,
  };
}

export async function openOrCreateThread(
  phone: string,
  name: string
): Promise<{ ok: true; conversation: Conversation } | { ok: false; error: string }> {
  await ready();
  const waId = toWaId(phone);
  if (!waId) return { ok: false, error: 'Enter a valid phone number' };

  const existing = await findConversationByPhone(waId);
  if (existing) {
    const { waId: _waId, ...conversation } = existing;
    return { ok: true, conversation };
  }

  const displayName = name.trim() || formatDisplayPhone(waId);
  const avatar = avatarFor(displayName);
  const id = `conv_${waId}`;
  await getPool().query(
    `INSERT INTO conversations (
       id, contact_id, wa_id, name, phone, category, status,
       unread_count, is_online, initials, avatar_bg, avatar_color, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,'New',0,true,$7,$8,$9,now())
     ON CONFLICT (wa_id) DO NOTHING`,
    [
      id,
      `wa_${waId}`,
      waId,
      displayName,
      formatDisplayPhone(waId),
      'General Inquiry',
      avatar.initials,
      avatar.avatarBg,
      avatar.avatarColor,
    ]
  );
  const created = await findConversationByPhone(waId);
  if (!created) return { ok: false, error: 'Conversation not found' };
  const { waId: _waId, ...conversation } = created;
  return { ok: true, conversation };
}

export async function appendOutbound(input: {
  threadId: string;
  text: string;
  metaMessageId: string;
  isTemplate?: boolean;
  templateName?: string;
}): Promise<{ ok: true; conversation: Conversation } | { ok: false; error: string }> {
  await ready();
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query<{ id: string }>(
      `SELECT id FROM conversations
       WHERE id = $1 OR wa_id = $2
       LIMIT 1
       FOR UPDATE`,
      [input.threadId, toWaId(input.threadId) ?? input.threadId]
    );
    const id = found.rows[0]?.id;
    if (!id) {
      await client.query('ROLLBACK');
      return { ok: false, error: 'Conversation not found' };
    }

    const position = await client.query<{ next: number }>(
      `SELECT COALESCE(MAX(position), 0) + 1 AS next
       FROM messages WHERE conversation_id = $1`,
      [id]
    );
    const { timestamp, dateGroup } = nowParts();
    await client.query(
      `INSERT INTO messages (
         id, conversation_id, sender, body, display_time, date_group,
         is_template, template_name, status, meta_message_id, position
       ) VALUES ($1,$2,'agent',$3,$4,$5,$6,$7,'sent',$8,$9)`,
      [
        `m_${Date.now()}`,
        id,
        input.text,
        timestamp,
        dateGroup,
        Boolean(input.isTemplate),
        input.templateName ?? null,
        input.metaMessageId,
        position.rows[0]?.next ?? 1,
      ]
    );
    await client.query(
      `UPDATE conversations
       SET unread_count = 0, updated_at = now()
       WHERE id = $1`,
      [id]
    );
    await client.query('COMMIT');
    const conversation = await loadConversation(id);
    if (!conversation) return { ok: false, error: 'Conversation not found' };
    return { ok: true, conversation };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function recordBroadcast(input: {
  name: string;
  categories: string[];
  labels: string[];
  matchedCount: number;
}): Promise<Conversation> {
  await ready();
  const { timestamp, dateGroup } = nowParts();
  const stamp = Date.now();
  const id = `conv_bc_${stamp}`;
  const text = `[Broadcast Campaign] ${input.name}\nCategories: ${input.categories.join(', ')}${
    input.labels.length ? ` · Labels: ${input.labels.join(', ')}` : ''
  }\nRecipients: ${input.matchedCount} contacts.`;
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO conversations (
         id, contact_id, wa_id, name, phone, category, status,
         unread_count, is_online, initials, avatar_bg, avatar_color, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,'Qualified',0,true,'BC','#ddf3e5','#0b5c46',now())`,
      [
        id,
        `bc_${stamp}`,
        id,
        input.name,
        `${input.matchedCount} contacts`,
        input.categories.join(', ') || 'Broadcast',
      ]
    );
    await client.query(
      `INSERT INTO messages (
         id, conversation_id, sender, body, display_time, date_group,
         is_template, status, position
       ) VALUES ($1,$2,'agent',$3,$4,$5,false,'sent',1)`,
      [`m_${stamp}`, id, text, timestamp, dateGroup]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  const conversation = await loadConversation(id);
  if (!conversation) throw new Error('Broadcast conversation was not stored');
  return conversation;
}

export async function applyInboundMessage(input: {
  waId: string;
  profileName?: string;
  text: string;
  metaMessageId: string;
  timestampMs?: number;
}): Promise<void> {
  await ready();
  const waId = toWaId(input.waId);
  if (!waId) return;

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const duplicate = await client.query(
      'SELECT 1 FROM messages WHERE meta_message_id = $1',
      [input.metaMessageId]
    );
    if (duplicate.rowCount) {
      await client.query('ROLLBACK');
      return;
    }

    let conversationId: string | undefined;
    const existing = await client.query<{ id: string }>(
      'SELECT id FROM conversations WHERE wa_id = $1 FOR UPDATE',
      [waId]
    );
    conversationId = existing.rows[0]?.id;

    if (!conversationId) {
      const name = input.profileName?.trim() || formatDisplayPhone(waId);
      const avatar = avatarFor(name);
      conversationId = `conv_${waId}`;
      await client.query(
        `INSERT INTO conversations (
           id, contact_id, wa_id, name, phone, category, status,
           unread_count, is_online, initials, avatar_bg, avatar_color, updated_at
         ) VALUES ($1,$2,$3,$4,$5,'General Inquiry','New',0,true,$6,$7,$8,now())`,
        [
          conversationId,
          `wa_${waId}`,
          waId,
          name,
          formatDisplayPhone(waId),
          avatar.initials,
          avatar.avatarBg,
          avatar.avatarColor,
        ]
      );
    } else if (input.profileName?.trim()) {
      await client.query('UPDATE conversations SET name = $2 WHERE id = $1', [
        conversationId,
        input.profileName.trim(),
      ]);
    }

    const when = input.timestampMs ? new Date(input.timestampMs * 1000) : new Date();
    const position = await client.query<{ next: number }>(
      `SELECT COALESCE(MAX(position), 0) + 1 AS next
       FROM messages WHERE conversation_id = $1`,
      [conversationId]
    );
    await client.query(
      `INSERT INTO messages (
         id, conversation_id, sender, body, display_time, date_group,
         is_template, meta_message_id, position
       ) VALUES ($1,$2,'contact',$3,$4,'Today',false,$5,$6)`,
      [
        `m_${input.metaMessageId}`,
        conversationId,
        input.text,
        when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        input.metaMessageId,
        position.rows[0]?.next ?? 1,
      ]
    );
    await client.query(
      `UPDATE conversations
       SET unread_count = unread_count + 1, updated_at = now()
       WHERE id = $1`,
      [conversationId]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function applyMessageStatus(input: {
  metaMessageId: string;
  status: 'sent' | 'delivered' | 'read';
}): Promise<void> {
  await ready();
  await getPool().query(
    `UPDATE messages SET status = $2 WHERE meta_message_id = $1`,
    [input.metaMessageId, input.status]
  );
}

export async function getThreadWaId(threadId: string): Promise<string | null> {
  await ready();
  const { rows } = await getPool().query<{ wa_id: string }>(
    `SELECT wa_id FROM conversations
     WHERE id = $1 OR wa_id = $2
     LIMIT 1`,
    [threadId, toWaId(threadId) ?? threadId]
  );
  return rows[0]?.wa_id ?? null;
}
