import {
  randomUUID,
} from 'node:crypto'

import {
  initializeChatwootWidget,
} from '../clients/chatwoot-client.js'

import {
  createPublicSession,
  updatePublicSessionChatwootWidget,
} from '../repositories/public-session-repository.js'

import type {
  Locale,
  StartSessionResult,
} from '../types/chat.js'

export async function createSession(
  locale: Locale = 'ar',
): Promise<StartSessionResult> {
  const publicSessionId =
    randomUUID()

  const session =
    await createPublicSession(
      publicSessionId,
      locale,
    )

  const chatwootWidget =
    await initializeChatwootWidget(
      session.inboxId,
    )

  const initializedSession =
    await updatePublicSessionChatwootWidget(
      publicSessionId,
      chatwootWidget,
    )

  if (!initializedSession) {
    throw new Error(
      'Failed to persist Chatwoot widget session mapping',
    )
  }

  return {
    context: {
      conversationId:
        publicSessionId,

      locale,
      mode:
        'assistant',

      contact: {},
      service: {},
    },

    messages: [],
  }
}