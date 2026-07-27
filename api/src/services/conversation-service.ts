import {
  randomUUID,
} from 'node:crypto'

import {
  findPublicSessionById,
  updatePublicSessionService,
} from '../repositories/public-session-repository.js'

import type {
  ChatMessage,
  ChatMode,
  ConversationContext,
  LoadConversationResult,
  SendCustomerMessageInput,
  UpdateServiceInput,
} from '../types/chat.js'

function mapSessionStatusToChatMode(
  status: string,
): ChatMode {
  if (status === 'handoff_pending') {
    return 'handoff_pending'
  }

  if (status === 'human') {
    return 'human'
  }

  return 'assistant'
}

function buildConversationContext(
  session: Awaited<
    ReturnType<typeof findPublicSessionById>
  > extends infer T
    ? Exclude<T, null>
    : never,
): ConversationContext {
  return {
    conversationId:
      session.publicSessionId,

    locale:
      session.locale,

    mode:
      mapSessionStatusToChatMode(
        session.status,
      ),

    contact: {},

    service:
      session.metadata.service ?? {},
  }
}

export async function loadConversation(
  publicSessionId: string,
): Promise<LoadConversationResult | null> {
  const session =
    await findPublicSessionById(
      publicSessionId,
    )

  if (!session) {
    return null
  }

  return {
    context:
      buildConversationContext(
        session,
      ),

    messages: [],
  }
}

export async function createCustomerMessage(
  input: SendCustomerMessageInput,
): Promise<ChatMessage | null> {
  const session =
    await findPublicSessionById(
      input.publicSessionId,
    )

  if (!session) {
    return null
  }

  return {
    id:
      randomUUID(),

    author:
      'customer',

    content:
      input.content.trim(),

    createdAt:
      new Date().toISOString(),

    status:
      'sent',
  }
}

export async function updateConversationService(
  input: UpdateServiceInput,
): Promise<ConversationContext | null> {
  const updatedSession =
    await updatePublicSessionService(
      input.publicSessionId,
      input.service,
    )

  if (!updatedSession) {
    return null
  }

  return buildConversationContext(
    updatedSession,
  )
}