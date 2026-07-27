import { randomUUID } from 'node:crypto'

import type {
  Locale,
  StartSessionResult,
} from '../types/chat.js'

export function createSession(
  locale: Locale = 'ar',
): StartSessionResult {
  return {
    context: {
      conversationId: randomUUID(),
      locale,
      mode: 'assistant',
      contact: {},
      service: {},
    },
    messages: [],
  }
}