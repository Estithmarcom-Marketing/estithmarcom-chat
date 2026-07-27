import {
  findPublicSessionById,
} from '../repositories/public-session-repository.js'

import type {
  ChatMode,
  LoadConversationResult,
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