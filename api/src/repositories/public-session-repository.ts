import {
  databasePool,
} from '../config/database.js'

import type {
  CustomerContact,
  Locale,
  SelectedServiceContext,
} from '../types/chat.js'

export interface PublicSessionRecord {
  publicSessionId: string
  conversationId: number | null
  accountId: number
  inboxId: number
  locale: Locale
  status: string

  chatwootSourceId: string | null
  chatwootContactId: number | null
  chatwootAuthToken: string | null
  chatwootInitializedAt: string | null

  metadata: {
    service?: SelectedServiceContext
    contact?: CustomerContact
    handoffReason?: string
    originalQuestion?: string
    intent?: string
    preferredContactTime?: string
  }

  createdAt: string
  updatedAt: string
}

export interface ConversationRuntimeState {
  handoffRequested: boolean
  humanMode: boolean
  humanModeStartedAt: string | null
}

interface PublicSessionRow {
  public_session_id: string
  conversation_id: string | null
  account_id: string
  inbox_id: string
  locale: Locale
  status: string

  chatwoot_source_id: string | null
  chatwoot_contact_id: string | null
  chatwoot_auth_token: string | null
  chatwoot_initialized_at: Date | null

  metadata: {
    service?: SelectedServiceContext
    contact?: CustomerContact
    handoffReason?: string
    originalQuestion?: string
    intent?: string
    preferredContactTime?: string
  }

  created_at: Date
  updated_at: Date
}

interface ConversationRuntimeStateRow {
  handoff_requested: boolean
  human_mode: boolean
  human_mode_started_at: Date | null
}

const publicSessionColumns = `
  public_session_id,
  conversation_id,
  account_id,
  inbox_id,
  locale,
  status,
  metadata,
  chatwoot_source_id,
  chatwoot_contact_id,
  chatwoot_auth_token,
  chatwoot_initialized_at,
  created_at,
  updated_at
`

function mapPublicSessionRow(
  row: PublicSessionRow,
): PublicSessionRecord {
  return {
    publicSessionId:
      row.public_session_id,

    conversationId:
      row.conversation_id === null
        ? null
        : Number(
            row.conversation_id,
          ),

    accountId:
      Number(
        row.account_id,
      ),

    inboxId:
      Number(
        row.inbox_id,
      ),

    locale:
      row.locale,

    status:
      row.status,

    chatwootSourceId:
      row.chatwoot_source_id,

    chatwootContactId:
      row.chatwoot_contact_id === null
        ? null
        : Number(
            row.chatwoot_contact_id,
          ),

    chatwootAuthToken:
      row.chatwoot_auth_token,

    chatwootInitializedAt:
      row.chatwoot_initialized_at
        ?.toISOString() ?? null,

    metadata:
      row.metadata ?? {},

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
          ${publicSessionColumns}
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
          ${publicSessionColumns}
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

export async function findConversationRuntimeState(
  conversationId: number,
): Promise<ConversationRuntimeState> {
  const result =
    await databasePool.query<ConversationRuntimeStateRow>(
      `
        SELECT
          handoff_requested,
          human_mode,
          human_mode_started_at
        FROM est_chat_conversation_state
        WHERE conversation_id = $1
        LIMIT 1
      `,
      [
        conversationId,
      ],
    )

  const row =
    result.rows[0]

  if (!row) {
    return {
      handoffRequested: false,
      humanMode: false,
      humanModeStartedAt: null,
    }
  }

  return {
    handoffRequested:
      row.handoff_requested,

    humanMode:
      row.human_mode,

    humanModeStartedAt:
      row.human_mode_started_at
        ?.toISOString() ?? null,
  }
}

export async function updatePublicSessionChatwootWidget(
  publicSessionId: string,
  input: {
    contactId: number
    sourceId: string
    authToken: string
  },
): Promise<PublicSessionRecord | null> {
  const result =
    await databasePool.query<PublicSessionRow>(
      `
        UPDATE est_chat_public_sessions
        SET
          chatwoot_contact_id = $2,
          chatwoot_source_id = $3,
          chatwoot_auth_token = $4,
          chatwoot_initialized_at = now(),
          updated_at = now()
        WHERE public_session_id = $1
        RETURNING
          ${publicSessionColumns}
      `,
      [
        publicSessionId,
        input.contactId,
        input.sourceId,
        input.authToken,
      ],
    )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return mapPublicSessionRow(row)
}

export async function updatePublicSessionChatwootConversation(
  publicSessionId: string,
  conversationId: number,
): Promise<PublicSessionRecord | null> {
  const result =
    await databasePool.query<PublicSessionRow>(
      `
        UPDATE est_chat_public_sessions
        SET
          conversation_id = $2,
          updated_at = now()
        WHERE public_session_id = $1
        RETURNING
          ${publicSessionColumns}
      `,
      [
        publicSessionId,
        conversationId,
      ],
    )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return mapPublicSessionRow(row)
}

export async function updatePublicSessionService(
  publicSessionId: string,
  service: Required<SelectedServiceContext>,
): Promise<PublicSessionRecord | null> {
  const result =
    await databasePool.query<PublicSessionRow>(
      `
        UPDATE est_chat_public_sessions
        SET
          metadata = jsonb_set(
            COALESCE(
              metadata,
              '{}'::jsonb
            ),
            '{service}',
            $2::jsonb,
            true
          ),
          updated_at = now()
        WHERE public_session_id = $1
        RETURNING
          ${publicSessionColumns}
      `,
      [
        publicSessionId,
        JSON.stringify(
          service,
        ),
      ],
    )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return mapPublicSessionRow(row)
}

export async function updatePublicSessionContact(
  publicSessionId: string,
  contact: Partial<CustomerContact>,
): Promise<PublicSessionRecord | null> {
  const result =
    await databasePool.query<PublicSessionRow>(
      `
        UPDATE est_chat_public_sessions
        SET
          metadata = jsonb_set(
            COALESCE(
              metadata,
              '{}'::jsonb
            ),
            '{contact}',
            COALESCE(
              metadata -> 'contact',
              '{}'::jsonb
            ) || $2::jsonb,
            true
          ),
          updated_at = now()
        WHERE public_session_id = $1
        RETURNING
          ${publicSessionColumns}
      `,
      [
        publicSessionId,
        JSON.stringify(
          contact,
        ),
      ],
    )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return mapPublicSessionRow(row)
}

export async function requestPublicSessionHandoff(
  publicSessionId: string,
  handoff: {
    handoffReason?: string
    originalQuestion?: string
    intent?: string
  },
): Promise<PublicSessionRecord | null> {
  const result =
    await databasePool.query<PublicSessionRow>(
      `
        UPDATE est_chat_public_sessions
        SET
          status = 'handoff_pending',

          metadata =
            COALESCE(
              metadata,
              '{}'::jsonb
            )
            ||
            jsonb_strip_nulls(
              jsonb_build_object(
                'handoffReason',
                $2::text,

                'originalQuestion',
                $3::text,

                'intent',
                $4::text
              )
            ),

          updated_at = now()

        WHERE public_session_id = $1

        RETURNING
          ${publicSessionColumns}
      `,
      [
        publicSessionId,
        handoff.handoffReason ??
          null,

        handoff.originalQuestion ??
          null,

        handoff.intent ??
          null,
      ],
    )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return mapPublicSessionRow(row)
}

export async function updatePublicSessionPreferredContactTime(
  publicSessionId: string,
  preferredContactTime: string,
): Promise<PublicSessionRecord | null> {
  const result =
    await databasePool.query<PublicSessionRow>(
      `
        UPDATE est_chat_public_sessions
        SET
          metadata = jsonb_set(
            COALESCE(
              metadata,
              '{}'::jsonb
            ),
            '{preferredContactTime}',
            to_jsonb(
              $2::text
            ),
            true
          ),
          updated_at = now()
        WHERE public_session_id = $1
        RETURNING
          ${publicSessionColumns}
      `,
      [
        publicSessionId,
        preferredContactTime,
      ],
    )

  const row = result.rows[0]

  if (!row) {
    return null
  }

  return mapPublicSessionRow(row)
}