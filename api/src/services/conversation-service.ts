import {
  createChatwootWidgetMessage,
  loadChatwootWidgetMessages,
} from '../clients/chatwoot-client.js'

import {
  findPublicSessionById,
  requestPublicSessionHandoff,
  updatePublicSessionChatwootConversation,
  updatePublicSessionContact,
  updatePublicSessionPreferredContactTime,
  updatePublicSessionService,
} from '../repositories/public-session-repository.js'

import type {
  ChatMessage,
  ChatMode,
  ConversationContext,
  LoadConversationResult,
  MessageAuthor,
  PreferredContactTimeInput,
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

    preferredContactTime:
      session.metadata.preferredContactTime,
  }
}

function mapRestoredMessageAuthor(
  messageType: number,
  chatMode: ChatMode,
): MessageAuthor {
  if (messageType === 0) {
    return 'customer'
  }

  if (messageType === 1) {
    return chatMode === 'human'
      ? 'human'
      : 'assistant'
  }

  return 'system'
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

  const context =
    buildConversationContext(
      session,
    )

  if (!session.chatwootAuthToken) {
    return {
      context,
      messages: [],
    }
  }

  const chatwootMessages =
    await loadChatwootWidgetMessages(
      session.chatwootAuthToken,
    )

  const messages: ChatMessage[] =
    chatwootMessages
      .filter(
        (message) =>
          session.conversationId === null ||
          message.conversationId ===
            session.conversationId,
      )
      .map(
        (message) => ({
          id:
            String(
              message.messageId,
            ),

          author:
            mapRestoredMessageAuthor(
              message.messageType,
              context.mode,
            ),

          content:
            message.content,

          createdAt:
            message.createdAt,

          status:
            'sent',
        }),
      )

  return {
    context,
    messages,
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

  const authToken =
    session.chatwootAuthToken

  if (!authToken) {
    throw new Error(
      'Chatwoot widget session is not initialized',
    )
  }

  const content =
    input.content.trim()

  const chatwootMessage =
    await createChatwootWidgetMessage({
      authToken,
      content,
    })

  if (
    session.conversationId === null
  ) {
    const updatedSession =
      await updatePublicSessionChatwootConversation(
        input.publicSessionId,
        chatwootMessage.conversationId,
      )

    if (!updatedSession) {
      throw new Error(
        'Failed to persist Chatwoot conversation mapping',
      )
    }
  } else if (
    session.conversationId !==
    chatwootMessage.conversationId
  ) {
    throw new Error(
      'Chatwoot conversation mapping mismatch',
    )
  }

  return {
    id:
      String(
        chatwootMessage.messageId,
      ),

    author:
      'customer',

    content:
      chatwootMessage.content,

    createdAt:
      chatwootMessage.createdAt,

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

export async function updateConversationPreferredContactTime(
  input: PreferredContactTimeInput,
): Promise<ConversationContext | null> {
  const updatedSession =
    await updatePublicSessionPreferredContactTime(
      input.publicSessionId,
      input.preferredContactTime,
    )

  if (!updatedSession) {
    return null
  }

  return buildConversationContext(
    updatedSession,
  )
}