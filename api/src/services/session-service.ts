import {
  randomUUID,
} from 'node:crypto'

import {
  createChatwootContact,
  createChatwootConversation,
} from '../clients/chatwoot-client.js'

import {
  createPublicSession,
  updatePublicSessionChatwootContact,
  updatePublicSessionChatwootConversation,
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

  const chatwootContact =
    await createChatwootContact({
      publicSessionId,

      accountId:
        session.accountId,

      inboxId:
        session.inboxId,
    })

  const sessionWithContact =
    await updatePublicSessionChatwootContact(
      publicSessionId,
      chatwootContact,
    )

  if (!sessionWithContact) {
    throw new Error(
      'Failed to persist Chatwoot contact mapping',
    )
  }

  const chatwootConversation =
    await createChatwootConversation({
      accountId:
        session.accountId,

      inboxId:
        session.inboxId,

      contactId:
        chatwootContact.contactId,

      sourceId:
        chatwootContact.sourceId,
    })

  const initializedSession =
    await updatePublicSessionChatwootConversation(
      publicSessionId,
      chatwootConversation.conversationId,
    )

  if (!initializedSession) {
    throw new Error(
      'Failed to persist Chatwoot conversation mapping',
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