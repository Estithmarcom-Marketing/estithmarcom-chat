const CONVERSATION_ID_KEY =
  'estithmarcom_chat_conversation_id'

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