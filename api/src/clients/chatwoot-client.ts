import {
  chatwootConfig,
} from '../config/chatwoot.js'

interface ChatwootContactInbox {
  source_id?: string

  inbox?: {
    id?: number
  }
}

interface ChatwootContactPayload {
  id?: number

  contact_inboxes?: ChatwootContactInbox[]
}

interface ChatwootCreateContactResponse {
  id?: number

  payload?: ChatwootContactPayload[]
}

interface ChatwootCreateConversationResponse {
  id?: number
  account_id?: number
  inbox_id?: number
}

export interface CreatedChatwootContact {
  contactId: number
  sourceId: string
}

export interface CreatedChatwootConversation {
  conversationId: number
}

function isPositiveInteger(
  value: unknown,
): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0
  )
}

async function chatwootRequest<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const controller =
    new AbortController()

  const timeout =
    setTimeout(
      () => {
        controller.abort()
      },
      chatwootConfig.requestTimeoutMs,
    )

  try {
    const response =
      await fetch(
        `${chatwootConfig.baseUrl}${path}`,
        {
          ...init,

          signal:
            controller.signal,

          headers: {
            'Content-Type':
              'application/json',

            api_access_token:
              chatwootConfig.apiAccessToken,

            ...init.headers,
          },
        },
      )

    if (!response.ok) {
      throw new Error(
        `Chatwoot API request failed with status ${response.status}`,
      )
    }

    return await response.json() as T
  } finally {
    clearTimeout(timeout)
  }
}

export async function createChatwootContact(
  input: {
    publicSessionId: string
    accountId: number
    inboxId: number
  },
): Promise<CreatedChatwootContact> {
  const response =
    await chatwootRequest<ChatwootCreateContactResponse>(
      `/api/v1/accounts/${input.accountId}/contacts`,
      {
        method:
          'POST',

        body:
          JSON.stringify({
            inbox_id:
              input.inboxId,

            identifier:
              `est-chat:${input.publicSessionId}`,
          }),
      },
    )

  const payloadContact =
    response.payload?.[0]

  const contactId =
    isPositiveInteger(response.id)
      ? response.id
      : payloadContact?.id

  if (
    !isPositiveInteger(contactId)
  ) {
    throw new Error(
      'Chatwoot did not return a valid contact id',
    )
  }

  const contactInbox =
    payloadContact
      ?.contact_inboxes
      ?.find(
        (item) =>
          item.inbox?.id ===
          input.inboxId,
      )

  const sourceId =
    contactInbox?.source_id?.trim()

  if (!sourceId) {
    throw new Error(
      'Chatwoot did not return a source id for the requested inbox',
    )
  }

  return {
    contactId,
    sourceId,
  }
}

export async function createChatwootConversation(
  input: {
    accountId: number
    inboxId: number
    contactId: number
    sourceId: string
  },
): Promise<CreatedChatwootConversation> {
  const response =
    await chatwootRequest<ChatwootCreateConversationResponse>(
      `/api/v1/accounts/${input.accountId}/conversations`,
      {
        method:
          'POST',

        body:
          JSON.stringify({
            source_id:
              input.sourceId,

            inbox_id:
              input.inboxId,

            contact_id:
              input.contactId,

            status:
              'open',
          }),
      },
    )

  if (
    !isPositiveInteger(
      response.id,
    )
  ) {
    throw new Error(
      'Chatwoot did not return a valid conversation id',
    )
  }

  return {
    conversationId:
      response.id,
  }
}