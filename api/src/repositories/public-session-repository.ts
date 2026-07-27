import {
  databasePool,
} from '../config/database.js'

import type {
  Locale,
} from '../types/chat.js'

export interface PublicSessionRecord {
  publicSessionId: string
  conversationId: number | null
  accountId: number
  inboxId: number
  locale: Locale
  status: string
  createdAt: string
  updatedAt: string
}

interface PublicSessionRow {
  public_session_id: string
  conversation_id: string | null
  account_id: string
  inbox_id: string
  locale: Locale
  status: string
  created_at: Date
  updated_at: Date
}

function mapPublicSessionRow(
  row: PublicSessionRow,
): PublicSessionRecord {
  return {
    publicSessionId:
      row.public_session_id,

    conversationId:
      row.conversation_id === null
        ? null
        : Number(row.conversation_id),

    accountId:
      Number(row.account_id),

    inboxId:
      Number(row.inbox_id),

    locale:
      row.locale,

    status:
      row.status,

    createdAt:
      row.created_at.toISOString(),

    updatedAt:
      row.updated_at.toISOString(),
  }
}

export async function createPublicSession(
  publicSessionId: string,
  locale: Locale,
): Promise<PublicSessionRecord> {
  const result =
    await databasePool.query<PublicSessionRow>(
      `
        INSERT INTO est_chat_public_sessions (
          public_session_id,
          locale
        )
        VALUES ($1, $2)
        RETURNING
          public_session_id,
          conversation_id,
          account_id,
          inbox_id,
          locale,
          status,
          created_at,
          updated_at
      `,
      [
        publicSessionId,
        locale,
      ],
    )

  const row = result.rows[0]

  if (!row) {
    throw new Error(
      'Failed to create public chat session',
    )
  }

  return mapPublicSessionRow(row)
}

export async function findPublicSessionById(
  publicSessionId: string,
): Promise<PublicSessionRecord | null> {
  const result =
    await databasePool.query<PublicSessionRow>(
      `
        SELECT
          public_session_id,
          conversation_id,
          account_id,
          inbox_id,
          locale,
          status,
          created_at,
          updated_at
        FROM est_chat_public_sessions
        WHERE public_session_id = $1
        LIMIT 1
      `,
      [
        publicSessionId,
      ],
    )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return mapPublicSessionRow(row)
}