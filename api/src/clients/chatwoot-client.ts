import {
  chatwootConfig,
} from '../config/chatwoot.js'

interface ChatwootWidgetConfigResponse {
  website_channel_config?: {
    auth_token?: string
    website_token?: string
  }

  contact?: {
    id?: number
    pubsub_token?: string
  }
}

interface ChatwootWidgetTokenPayload {
  source_id?: string
  inbox_id?: number
  exp?: number
  iat?: number
}

interface ChatwootMessageContentAttributes {
  estithmarcom_origin?: string

  [key: string]: unknown
}

interface ChatwootWidgetMessageResponse {
  id?: number
  content?: string
  message_type?: number
  content_type?: string
  content_attributes?: ChatwootMessageContentAttributes
  created_at?: number
  conversation_id?: number

  sender?: {
    id?: number
    type?: string
    name?: string
  }
}

interface ChatwootWidgetMessagesResponse {
  payload?: ChatwootWidgetMessageResponse[]
}

export interface InitializedChatwootWidget {
  contactId: number
  sourceId: string
  authToken: string
}

export interface CreatedChatwootMessage {
  messageId: number
  conversationId: number
  content: string
  createdAt: string
}

export interface ChatwootRestoredMessage {
  messageId: number
  conversationId: number
  messageType: number
  content: string
  createdAt: string
  senderType?: string
  senderId?: number
  contentAttributes: ChatwootMessageContentAttributes
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

async function readErrorResponse(
  response: Response,
): Promise<string> {
  try {
    return await response.text()
  } catch {
    return ''
  }
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

            ...init.headers,
          },
        },
      )

    if (!response.ok) {
      const responseBody =
        await readErrorResponse(
          response,
        )

      throw new Error(
        `Chatwoot API request failed with status ${response.status}: ${responseBody}`,
      )
    }

    return await response.json() as T
  } finally {
    clearTimeout(timeout)
  }
}

function decodeWidgetToken(
  token: string,
): ChatwootWidgetTokenPayload {
  const parts =
    token.split('.')

  if (parts.length !== 3) {
    throw new Error(
      'Chatwoot returned an invalid widget auth token',
    )
  }

  const payloadPart =
    parts[1]

  if (!payloadPart) {
    throw new Error(
      'Chatwoot widget auth token has no payload',
    )
  }

  try {
    const payload =
      Buffer
        .from(
          payloadPart,
          'base64url',
        )
        .toString(
          'utf8',
        )

    return JSON.parse(
      payload,
    ) as ChatwootWidgetTokenPayload
  } catch {
    throw new Error(
      'Unable to decode Chatwoot widget auth token',
    )
  }
}

export async function initializeChatwootWidget(
  expectedInboxId: number,
): Promise<InitializedChatwootWidget> {
  const response =
    await chatwootRequest<ChatwootWidgetConfigResponse>(
      '/api/v1/widget/config',
      {
        method:
          'POST',

        body:
          JSON.stringify({
            website_token:
              chatwootConfig.websiteToken,
          }),
      },
    )

  const authToken =
    response
      .website_channel_config
      ?.auth_token
      ?.trim()

  if (!authToken) {
    throw new Error(
      'Chatwoot did not return a widget auth token',
    )
  }

  const contactId =
    response.contact?.id

  if (
    !isPositiveInteger(
      contactId,
    )
  ) {
    throw new Error(
      'Chatwoot did not return a valid widget contact id',
    )
  }

  const tokenPayload =
    decodeWidgetToken(
      authToken,
    )

  const sourceId =
    tokenPayload
      .source_id
      ?.trim()

  if (!sourceId) {
    throw new Error(
      'Chatwoot widget auth token does not contain source_id',
    )
  }

  if (
    tokenPayload.inbox_id !==
    expectedInboxId
  ) {
    throw new Error(
      'Chatwoot widget token inbox does not match public session inbox',
    )
  }

  return {
    contactId,
    sourceId,
    authToken,
  }
}

export async function createChatwootWidgetMessage(
  input: {
    authToken: string
    content: string
  },
): Promise<CreatedChatwootMessage> {
  const response =
    await chatwootRequest<ChatwootWidgetMessageResponse>(
      '/api/v1/widget/messages',
      {
        method:
          'POST',

        headers: {
          'X-Auth-Token':
            input.authToken,
        },

        body:
          JSON.stringify({
            website_token:
              chatwootConfig.websiteToken,

            message: {
              content:
                input.content,
            },
          }),
      },
    )

  if (
    !isPositiveInteger(
      response.id,
    )
  ) {
    throw new Error(
      'Chatwoot did not return a valid message id',
    )
  }

  if (
    !isPositiveInteger(
      response.conversation_id,
    )
  ) {
    throw new Error(
      'Chatwoot did not return a valid conversation id',
    )
  }

  if (
    typeof response.created_at !==
      'number' ||
    !Number.isFinite(
      response.created_at,
    )
  ) {
    throw new Error(
      'Chatwoot did not return a valid message creation time',
    )
  }

  return {
    messageId:
      response.id,

    conversationId:
      response.conversation_id,

    content:
      response.content ??
      input.content,

    createdAt:
      new Date(
        response.created_at * 1000,
      ).toISOString(),
  }
}

export async function updateChatwootContact(
  input: {
    contactId: number
    name?: string
    phone?: string
    email?: string
  },
): Promise<void> {
  const payload: {
    name?: string
    phone_number?: string
    email?: string
  } = {}

  const name =
    input.name?.trim()

  const phone =
    input.phone?.trim()

  const email =
    input.email?.trim()

  if (name) {
    payload.name =
      name
  }

  if (phone) {
    payload.phone_number =
      phone
  }

  if (email) {
    payload.email =
      email
  }

  if (
    Object.keys(payload)
      .length === 0
  ) {
    return
  }

  await chatwootRequest<unknown>(
    `/api/v1/accounts/${chatwootConfig.accountId}/contacts/${input.contactId}`,
    {
      method:
        'PUT',

      headers: {
        api_access_token:
          chatwootConfig.apiAccessToken,
      },

      body:
        JSON.stringify(
          payload,
        ),
    },
  )
}

export async function createChatwootConversation(
  input: {
    sourceId: string
    inboxId: number
    contactId: number
    customAttributes?: Record<
      string,
      string | number | boolean
    >
  },
): Promise<number> {
  const response =
    await chatwootRequest<{
      id?: number
    }>(
      `/api/v1/accounts/${chatwootConfig.accountId}/conversations`,
      {
        method:
          'POST',

        headers: {
          api_access_token:
            chatwootConfig.apiAccessToken,
        },

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

            custom_attributes:
              input.customAttributes ?? {},
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

  return response.id
}
export async function updateChatwootConversationAttributes(
  input: {
    conversationId: number
    attributes: Record<
      string,
      string | number | boolean
    >
  },
): Promise<void> {
  await chatwootRequest<unknown>(
    `/api/v1/accounts/${chatwootConfig.accountId}/conversations/${input.conversationId}/custom_attributes`,
    {
      method:
        'POST',

      headers: {
        api_access_token:
          chatwootConfig.apiAccessToken,
      },

      body:
        JSON.stringify({
          custom_attributes:
            input.attributes,
        }),
    },
  )
}

export async function loadChatwootWidgetMessages(
  authToken: string,
): Promise<ChatwootRestoredMessage[]> {
  const response =
    await chatwootRequest<
      ChatwootWidgetMessageResponse[] |
      ChatwootWidgetMessagesResponse
    >(
      `/api/v1/widget/messages?website_token=${encodeURIComponent(
        chatwootConfig.websiteToken,
      )}`,
      {
        method:
          'GET',

        headers: {
          'X-Auth-Token':
            authToken,
        },
      },
    )

  const messages =
    Array.isArray(response)
      ? response
      : response.payload ?? []

  return messages
    .filter(
      (
        message,
      ): message is ChatwootWidgetMessageResponse & {
        id: number
        conversation_id: number
        message_type: number
        created_at: number
      } =>
        isPositiveInteger(
          message.id,
        ) &&
        isPositiveInteger(
          message.conversation_id,
        ) &&
        typeof message.message_type ===
          'number' &&
        typeof message.created_at ===
          'number' &&
        Number.isFinite(
          message.created_at,
        ),
    )
    .map(
      (message) => ({
        messageId:
          message.id,

        conversationId:
          message.conversation_id,

        messageType:
          message.message_type,

        content:
          message.content ?? '',

        createdAt:
          new Date(
            message.created_at * 1000,
          ).toISOString(),

        senderType:
          message.sender?.type,

        senderId:
          message.sender?.id,

        contentAttributes:
          message.content_attributes ?? {},
      }),
    )
}
