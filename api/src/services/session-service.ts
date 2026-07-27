import {
  randomUUID,
} from 'node:crypto'

import {
  createPublicSession,
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

  await createPublicSession(
    publicSessionId,
    locale,
  )

  return {
    context: {
      conversationId:
        publicSessionId,

      locale,
      mode: 'assistant',
      contact: {},
      service: {},
    },

    messages: [],
  }
}