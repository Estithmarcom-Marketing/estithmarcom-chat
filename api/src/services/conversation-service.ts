import {
  randomUUID,
} from 'node:crypto'

import {
  findPublicSessionById,
  requestPublicSessionHandoff,
  updatePublicSessionContact,
  updatePublicSessionService,
} from '../repositories/public-session-repository.js'

import type {
  ChatMessage,
  ChatMode,
  ConversationContext,
  LoadConversationResult,
  RequestHandoffInput,
  SendCustomerMessageInput,
  UpdateContactInput,
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

    contact:
      session.metadata.contact ?? {},

    service:
      session.metadata.service ?? {},

    originalQuestion:
      session.metadata.originalQuestion,

    intent:
      session.metadata.intent,

    handoffReason:
      session.metadata.handoffReason,
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

export async function updateConversationContact(
  input: UpdateContactInput,
): Promise<ConversationContext | null> {
  const updatedSession =
    await updatePublicSessionContact(
      input.publicSessionId,
      input.contact,
    )

  if (!updatedSession) {
    return null
  }

  return buildConversationContext(
    updatedSession,
  )
}

export async function requestConversationHandoff(
  input: RequestHandoffInput,
): Promise<ConversationContext | null> {
  const updatedSession =
    await requestPublicSessionHandoff(
      input.publicSessionId,
      {
        handoffReason:
          input.handoffReason,

        originalQuestion:
          input.originalQuestion,

        intent:
          input.intent,
      },
    )

  if (!updatedSession) {
    return null
  }

  return buildConversationContext(
    updatedSession,
  )
}