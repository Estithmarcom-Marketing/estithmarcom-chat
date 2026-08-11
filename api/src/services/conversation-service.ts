import {
  createChatwootConversation,
  createChatwootWidgetMessage,
  loadChatwootWidgetMessages,
  updateChatwootContact,
  updateChatwootConversationAttributes,
} from '../clients/chatwoot-client.js'

import {
  normalizePhoneNumber,
} from '../lib/phone.js'

import {
  findConversationRuntimeState,
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
  runtimeMode?: ChatMode,
): ConversationContext {
  return {
    conversationId:
      session.publicSessionId,

    locale:
      session.locale,

    mode:
      runtimeMode ??
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

function mapRuntimeMode(
  input: {
    publicSessionStatus: string
    handoffRequested: boolean
    humanMode: boolean
  },
): ChatMode {
  if (input.humanMode) {
    return 'human'
  }

  if (
    input.handoffRequested ||
    input.publicSessionStatus ===
      'handoff_pending'
  ) {
    return 'handoff_pending'
  }

  return 'assistant'
}

function mapRestoredMessageAuthor(
  input: {
    messageType: number
    createdAt: string
    senderType?: string
    estithmarcomOrigin?: string
    humanModeStartedAt?: string | null
  },
): MessageAuthor {
  if (input.messageType === 0) {
    return 'customer'
  }

  if (input.messageType !== 1) {
    return 'system'
  }

  if (
    input.estithmarcomOrigin ===
    'handoff_notice'
  ) {
    return 'system'
  }

  if (
    input.estithmarcomOrigin ===
    'assistant'
  ) {
    return 'assistant'
  }

  const normalizedSenderType =
    input.senderType
      ?.trim()
      .toLowerCase()

  if (
    normalizedSenderType ===
      'user' &&
    input.humanModeStartedAt
  ) {
    const messageTime =
      Date.parse(
        input.createdAt,
      )

    const humanModeTime =
      Date.parse(
        input.humanModeStartedAt,
      )

    if (
      Number.isFinite(
        messageTime,
      ) &&
      Number.isFinite(
        humanModeTime,
      ) &&
      messageTime >=
        humanModeTime
    ) {
      return 'human'
    }
  }

  return 'assistant'
}

function isDuplicateChatwootPhoneError(
  error: unknown,
): boolean {
  return (
    error instanceof Error &&
    error.message.includes(
      'Phone number has already been taken',
    )
  )
}

async function synchronizeChatwootContactSafely(
  input: {
    publicSessionId: string
    contactId: number
    name?: string
    phone?: string
    email?: string
  },
): Promise<void> {
  try {
    await updateChatwootContact({
      contactId:
        input.contactId,

      name:
        input.name,

      phone:
        input.phone,

      email:
        input.email,
    })
  } catch (error) {
    if (!isDuplicateChatwootPhoneError(error)) {
      throw error
    }

    console.warn(
      'Chatwoot contact phone already belongs to another contact; continuing with conversation customer_phone attribute.',
      {
        publicSessionId:
          input.publicSessionId,

        chatwootContactId:
          input.contactId,
      },
    )
  }
}

function buildHandoffAttributes(
  input: {
    publicSessionId: string

    contact?: {
      phone?: string
    }

    service?: {
      categoryId?: string
      categoryName?: string
      platformId?: string
      platformName?: string
      serviceId?: string
      serviceName?: string
    }

    handoffReason?: string
    intent?: string
  },
): Record<string, string> {
  const attributes:
    Record<string, string> = {
      public_session_id:
        input.publicSessionId,
    }

  const normalizedPhone =
    normalizePhoneNumber(
      input.contact?.phone,
    )

  if (normalizedPhone) {
    attributes.customer_phone =
      normalizedPhone
  }

  const service =
    input.service

  if (service?.serviceId) {
    attributes.service_id =
      service.serviceId
  }

  if (service?.serviceName) {
    attributes.service_name =
      service.serviceName
  }

  if (service?.categoryId) {
    attributes.category_id =
      service.categoryId
  }

  if (service?.categoryName) {
    attributes.category_name =
      service.categoryName
  }

  if (service?.platformId) {
    attributes.platform_id =
      service.platformId
  }

  if (service?.platformName) {
    attributes.platform_name =
      service.platformName
  }

  if (input.handoffReason) {
    attributes.handoff_reason =
      input.handoffReason
  }

  if (input.intent) {
    attributes.intent =
      input.intent
  }

  return attributes
}

async function ensureChatwootConversationContext(
  input: {
    publicSessionId: string
    handoffReason?: string
    intent?: string
  },
): Promise<number> {
  const session =
    await findPublicSessionById(
      input.publicSessionId,
    )

  if (!session) {
    throw new Error(
      'Public chat session not found',
    )
  }

  if (
    !session.chatwootContactId
  ) {
    throw new Error(
      'Chatwoot contact is not initialized',
    )
  }

  await synchronizeChatwootContactSafely({
    publicSessionId:
      input.publicSessionId,

    contactId:
      session.chatwootContactId,

    name:
      session.metadata.contact?.name,

    phone:
      session.metadata.contact?.phone,

    email:
      session.metadata.contact?.email,
  })

  const attributes =
    buildHandoffAttributes({
      publicSessionId:
        input.publicSessionId,

      contact:
        session.metadata.contact,

      service:
        session.metadata.service,

      handoffReason:
        input.handoffReason,

      intent:
        input.intent,
    })

  if (
    session.conversationId !==
    null
  ) {
    await updateChatwootConversationAttributes({
      conversationId:
        session.conversationId,

      attributes,
    })

    return session.conversationId
  }

  if (!session.chatwootSourceId) {
    throw new Error(
      'Chatwoot widget session is not initialized',
    )
  }

  const conversationId =
    await createChatwootConversation({
      sourceId:
        session.chatwootSourceId,

      inboxId:
        session.inboxId,

      contactId:
        session.chatwootContactId,

      customAttributes:
        attributes,
    })

  const updatedSession =
    await updatePublicSessionChatwootConversation(
      input.publicSessionId,
      conversationId,
    )

  if (!updatedSession) {
    throw new Error(
      'Failed to persist Chatwoot conversation mapping',
    )
  }

  return conversationId
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

  const runtimeState =
    session.conversationId === null
      ? {
          handoffRequested: false,
          humanMode: false,
          humanModeStartedAt: null,
        }
      : await findConversationRuntimeState(
          session.conversationId,
        )

  const context =
    buildConversationContext(
      session,
      mapRuntimeMode({
        publicSessionStatus:
          session.status,

        handoffRequested:
          runtimeState.handoffRequested,

        humanMode:
          runtimeState.humanMode,
      }),
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
        (message) => {
          const origin =
            message
              .contentAttributes
              .estithmarcom_origin

          return {
            id:
              String(
                message.messageId,
              ),

            author:
              mapRestoredMessageAuthor({
                messageType:
                  message.messageType,

                createdAt:
                  message.createdAt,

                senderType:
                  message.senderType,

                estithmarcomOrigin:
                  typeof origin === 'string'
                    ? origin
                    : undefined,

                humanModeStartedAt:
                  runtimeState
                    .humanModeStartedAt,
              }),

            content:
              message.content,

            createdAt:
              message.createdAt,

            status:
              'sent',

            contentType:
              message.contentType,

            contentAttributes:
              message.contentAttributes,
          }
        },
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

  if (
    updatedSession.conversationId !==
    null
  ) {
    await updateChatwootConversationAttributes({
      conversationId:
        updatedSession.conversationId,

      attributes:
        buildHandoffAttributes({
          publicSessionId:
            input.publicSessionId,

          contact:
            updatedSession
              .metadata.contact,

          service:
            updatedSession
              .metadata.service,

          handoffReason:
            updatedSession
              .metadata.handoffReason,

          intent:
            updatedSession
              .metadata.intent,
        }),
    })
  }

  return buildConversationContext(
    updatedSession,
  )
}

export async function updateConversationContact(
  input: UpdateContactInput,
): Promise<ConversationContext | null> {
  const session =
    await findPublicSessionById(
      input.publicSessionId,
    )

  if (!session) {
    return null
  }

  const updatedSession =
    await updatePublicSessionContact(
      input.publicSessionId,
      input.contact,
    )

  if (!updatedSession) {
    return null
  }

  if (
    session.chatwootContactId
  ) {
    await synchronizeChatwootContactSafely({
      publicSessionId:
        input.publicSessionId,

      contactId:
        session.chatwootContactId,

      name:
        updatedSession.metadata
          .contact?.name,

      phone:
        updatedSession.metadata
          .contact?.phone,

      email:
        updatedSession.metadata
          .contact?.email,
    })
  }

  if (
    updatedSession.conversationId !==
    null
  ) {
    await updateChatwootConversationAttributes({
      conversationId:
        updatedSession.conversationId,

      attributes:
        buildHandoffAttributes({
          publicSessionId:
            input.publicSessionId,

          contact:
            updatedSession.metadata
              .contact,

          service:
            updatedSession.metadata
              .service,

          handoffReason:
            updatedSession.metadata
              .handoffReason,

          intent:
            updatedSession.metadata
              .intent,
        }),
    })
  }

  return buildConversationContext(
    updatedSession,
  )
}

export async function requestConversationHandoff(
  input: RequestHandoffInput,
): Promise<ConversationContext | null> {
  const session =
    await findPublicSessionById(
      input.publicSessionId,
    )

  if (!session) {
    return null
  }

  await ensureChatwootConversationContext({
    publicSessionId:
      input.publicSessionId,

    handoffReason:
      input.handoffReason,

    intent:
      input.intent,
  })

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

  if (
    updatedSession.conversationId !==
    null
  ) {
    await updateChatwootConversationAttributes({
      conversationId:
        updatedSession.conversationId,

      attributes: {
        ...buildHandoffAttributes({
          publicSessionId:
            input.publicSessionId,

          contact:
            updatedSession.metadata
              .contact,

          service:
            updatedSession.metadata
              .service,

          handoffReason:
            updatedSession.metadata
              .handoffReason,

          intent:
            updatedSession.metadata
              .intent,
        }),

        preferred_contact_time:
          input.preferredContactTime,
      },
    })
  }

  return buildConversationContext(
    updatedSession,
  )
}