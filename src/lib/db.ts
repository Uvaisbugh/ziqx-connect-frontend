import 'server-only';

import { Pool } from 'pg';

const globalForPg = globalThis as typeof globalThis & {
  __ziqxPg?: Pool;
  __ziqxInboxReady?: Promise<void>;
};

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!globalForPg.__ziqxPg) {
    globalForPg.__ziqxPg = new Pool({ connectionString, max: 5 });
  }
  return globalForPg.__ziqxPg;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS conversations (
  id text PRIMARY KEY,
  contact_id text NOT NULL,
  wa_id text NOT NULL UNIQUE,
  name text NOT NULL,
  phone text NOT NULL,
  category text NOT NULL,
  status text NOT NULL CHECK (status IN ('New', 'Qualified', 'Contacted', 'Converted', 'Lost')),
  unread_count integer NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
  is_online boolean NOT NULL DEFAULT false,
  initials text NOT NULL,
  avatar_bg text NOT NULL,
  avatar_color text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY,
  conversation_id text NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('contact', 'agent')),
  body text NOT NULL,
  display_time text NOT NULL,
  date_group text NOT NULL CHECK (date_group IN ('Yesterday', 'Today')),
  is_template boolean NOT NULL DEFAULT false,
  template_name text,
  status text CHECK (status IS NULL OR status IN ('sent', 'delivered', 'read')),
  meta_message_id text UNIQUE,
  position integer NOT NULL,
  UNIQUE (conversation_id, position)
);

CREATE INDEX IF NOT EXISTS conversations_updated_at_idx
  ON conversations (updated_at DESC);
`;

export type SeedConversation = {
  id: string;
  contactId: string;
  waId: string;
  name: string;
  phone: string;
  category: string;
  status: 'New' | 'Qualified' | 'Contacted' | 'Converted' | 'Lost';
  unreadCount: number;
  isOnline: boolean;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  updatedAt: string;
  messages: {
    id: string;
    sender: 'contact' | 'agent';
    text: string;
    timestamp: string;
    dateGroup: 'Yesterday' | 'Today';
    isTemplate?: boolean;
    templateName?: string;
    status?: 'sent' | 'delivered' | 'read';
  }[];
};

export function ensureInboxDb(seed: SeedConversation[]): Promise<void> {
  if (!globalForPg.__ziqxInboxReady) {
    globalForPg.__ziqxInboxReady = migrateAndSeed(seed).catch((error) => {
      globalForPg.__ziqxInboxReady = undefined;
      throw error;
    });
  }
  return globalForPg.__ziqxInboxReady;
}

async function migrateAndSeed(seed: SeedConversation[]): Promise<void> {
  const pool = getPool();
  await pool.query(SCHEMA_SQL);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(814201)');
    const count = await client.query<{ n: string }>(
      'SELECT count(*)::text AS n FROM conversations'
    );
    if (count.rows[0]?.n === '0') {
      for (const conversation of seed) {
        await client.query(
          `INSERT INTO conversations (
             id, contact_id, wa_id, name, phone, category, status,
             unread_count, is_online, initials, avatar_bg, avatar_color, updated_at
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [
            conversation.id,
            conversation.contactId,
            conversation.waId,
            conversation.name,
            conversation.phone,
            conversation.category,
            conversation.status,
            conversation.unreadCount,
            conversation.isOnline,
            conversation.initials,
            conversation.avatarBg,
            conversation.avatarColor,
            conversation.updatedAt,
          ]
        );
        for (const [index, message] of conversation.messages.entries()) {
          await client.query(
            `INSERT INTO messages (
               id, conversation_id, sender, body, display_time, date_group,
               is_template, template_name, status, position
             ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
              message.id,
              conversation.id,
              message.sender,
              message.text,
              message.timestamp,
              message.dateGroup,
              Boolean(message.isTemplate),
              message.templateName ?? null,
              message.status ?? null,
              index + 1,
            ]
          );
        }
      }
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
