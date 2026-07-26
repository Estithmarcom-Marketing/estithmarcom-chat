const CONVERSATION_ID_KEY =
  'estithmarcom_chat_conversation_id'

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
  return localStorage.getItem(
    CONVERSATION_ID_KEY,
  )
}

export function clearConversationId(): void {
  localStorage.removeItem(
    CONVERSATION_ID_KEY,
  )
}
