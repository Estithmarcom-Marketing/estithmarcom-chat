import {
  randomUUID,
} from 'node:crypto'

import {
  findPublicSessionById,
} from '../repositories/public-session-repository.js'

import type {
  ChatMessage,
  ChatMode,
  LoadConversationResult,
  SendCustomerMessageInput,
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
    context: {
      conversationId:
        session.publicSessionId,

      locale:
        session.locale,

      mode:
        mapSessionStatusToChatMode(
          session.status,
        ),

      contact: {},
      service: {},
    },

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