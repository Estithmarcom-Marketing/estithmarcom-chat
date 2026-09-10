const CONVERSATION_ID_KEY =
  'estithmarcom_chat_conversation_id'

const ARCHIVED_CONVERSATIONS_KEY =
  'estithmarcom_chat_archived_conversations'

export interface ArchivedConversationReference {
  conversationId: string
  callbackSubmittedAt: string
  expiresAt: string
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function saveConversationId(
  conversationId: string,
): void {
  localStorage.setItem(
    CONVERSATION_ID_KEY,
    conversationId,
  )
}

export function loadConversationId():
  | string
  | null {
  const conversationId =
    localStorage.getItem(
      CONVERSATION_ID_KEY,
    )

  if (!conversationId) {
    return null
  }

  if (
    !UUID_PATTERN.test(
      conversationId,
    )
  ) {
    localStorage.removeItem(
      CONVERSATION_ID_KEY,
    )

    return null
  }

  return conversationId
}

export function clearConversationId(): void {
  localStorage.removeItem(
    CONVERSATION_ID_KEY,
  )
}

function parseArchivedConversationReference(
  value: unknown,
): ArchivedConversationReference | null {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return null
  }

  const candidate =
    value as Partial<ArchivedConversationReference>

  if (
    typeof candidate.conversationId !== 'string' ||
    !UUID_PATTERN.test(candidate.conversationId) ||
    typeof candidate.callbackSubmittedAt !== 'string' ||
    !Number.isFinite(
      Date.parse(candidate.callbackSubmittedAt),
    ) ||
    typeof candidate.expiresAt !== 'string' ||
    !Number.isFinite(
      Date.parse(candidate.expiresAt),
    )
  ) {
    return null
  }

  return candidate as ArchivedConversationReference
}

export function loadArchivedConversationReferences():
  ArchivedConversationReference[] {
  const stored =
    localStorage.getItem(
      ARCHIVED_CONVERSATIONS_KEY,
    )

  if (!stored) {
    return []
  }

  try {
    const parsed: unknown =
      JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      throw new Error('Invalid archive')
    }

    const active = parsed
      .map(parseArchivedConversationReference)
      .filter(
        (
          reference,
        ): reference is ArchivedConversationReference =>
          reference !== null &&
          Date.parse(reference.expiresAt) > Date.now(),
      )

    if (active.length === 0) {
      localStorage.removeItem(
        ARCHIVED_CONVERSATIONS_KEY,
      )
    } else if (active.length !== parsed.length) {
      localStorage.setItem(
        ARCHIVED_CONVERSATIONS_KEY,
        JSON.stringify(active),
      )
    }

    return active
  } catch {
    localStorage.removeItem(
      ARCHIVED_CONVERSATIONS_KEY,
    )

    return []
  }
}

export function saveArchivedConversationReference(
  reference: ArchivedConversationReference,
): void {
  const references =
    loadArchivedConversationReferences()
      .filter(
        ({ conversationId }) =>
          conversationId !== reference.conversationId,
      )

  references.push(reference)

  localStorage.setItem(
    ARCHIVED_CONVERSATIONS_KEY,
    JSON.stringify(references),
  )
}
