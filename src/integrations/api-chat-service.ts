import {
  env,
} from '../config/env'

import type {
  ChatMessage,
  ConversationContext,
} from '../types'

import type {
  ChatService,
  LoadConversationResult,
  PreferredContactTimeInput,
  RequestSpecialistInput,
  SelectServiceInput,
  SendMessageInput,
  StartSessionResult,
  UpdateContactInput,
} from '../services'

interface ApiErrorPayload {
  error?: string
  message?: string
}

export class ApiChatError extends Error {
  readonly status: number
  readonly code?: string

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message)

    this.name = 'ApiChatError'
    this.status = status
    this.code = code
  }
}

function apiUrl(
  path: string,
): string {
  const base =
    env.apiBaseUrl.replace(
      /\/+$/,
      '',
    )

  const normalizedPath =
    path.startsWith('/')
      ? path
      : `/${path}`

  return `${base}${normalizedPath}`
}

async function readErrorPayload(
  response: Response,
): Promise<ApiErrorPayload> {
  try {
    return await response.json() as ApiErrorPayload
  } catch {
    return {}
  }
}

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response =
    await fetch(
      apiUrl(path),
      {
        ...init,

        headers: {
          Accept:
            'application/json',

          ...(init.body
            ? {
                'Content-Type':
                  'application/json',
              }
            : {}),

          ...init.headers,
        },
      },
    )

  if (!response.ok) {
    const payload =
      await readErrorPayload(
        response,
      )

    throw new ApiChatError(
      payload.message ??
        payload.error ??
        `API request failed with status ${response.status}`,
      response.status,
      payload.error,
    )
  }

  return await response.json() as T
}

function requireConversationId(
  conversationId?: string,
): string {
  if (!conversationId) {
    throw new Error(
      'Conversation id is required',
    )
  }

  return conversationId
}

export function isConversationNotFoundError(
  error: unknown,
): boolean {
  return (
    error instanceof ApiChatError &&
    error.status === 404 &&
    error.code ===
      'conversation_not_found'
  )
}

export const apiChatService: ChatService = {
  async startSession():
    Promise<StartSessionResult> {
    return await apiRequest<StartSessionResult>(
      '/v1/sessions',
      {
        method:
          'POST',

        body:
          JSON.stringify({
            locale:
              'ar',
          }),
      },
    )
  },

  async loadConversation(
    conversationId: string,
  ): Promise<LoadConversationResult> {
    return await apiRequest<LoadConversationResult>(
      `/v1/conversations/${encodeURIComponent(
        conversationId,
      )}`,
    )
  },

  async sendMessage(
    input: SendMessageInput,
  ): Promise<ChatMessage> {
    const conversationId =
      requireConversationId(
        input.conversationId,
      )

    return await apiRequest<ChatMessage>(
      `/v1/conversations/${encodeURIComponent(
        conversationId,
      )}/messages`,
      {
        method:
          'POST',

        body:
          JSON.stringify({
            content:
              input.content,
          }),
      },
    )
  },

  async selectService(
    input: SelectServiceInput,
  ): Promise<ConversationContext> {
    const conversationId =
      requireConversationId(
        input.conversationId,
      )

    return await apiRequest<ConversationContext>(
      `/v1/conversations/${encodeURIComponent(
        conversationId,
      )}/service`,
      {
        method:
          'PUT',

        body:
          JSON.stringify({
            categoryId:
              input.categoryId,

            categoryName:
              input.categoryName,

            platformId:
              input.platformId,

            platformName:
              input.platformName,

            serviceId:
              input.serviceId,

            serviceName:
              input.serviceName,
          }),
      },
    )
  },

  async requestSpecialist(
    input: RequestSpecialistInput,
  ): Promise<ConversationContext> {
    const conversationId =
      requireConversationId(
        input.conversationId,
      )

    /*
     * Important:
     * send a real customer message first so Chatwoot/n8n
     * receives the handoff request. The public-session
     * handoff endpoint then persists the UI/runtime context.
     */
    await apiRequest<ChatMessage>(
      `/v1/conversations/${encodeURIComponent(
        conversationId,
      )}/messages`,
      {
        method:
          'POST',

        body:
          JSON.stringify({
            content:
              input.originalQuestion ??
              'أريد التحدث مع موظف مختص',
          }),
      },
    )

    return await apiRequest<ConversationContext>(
      `/v1/conversations/${encodeURIComponent(
        conversationId,
      )}/handoff`,
      {
        method:
          'POST',

        body:
          JSON.stringify({
            handoffReason:
              input.handoffReason ??
              'طلب العميل التحدث مع موظف مختص',

            originalQuestion:
              input.originalQuestion ??
              'أريد التحدث مع موظف مختص',

            intent:
              input.intent ??
              'human_handoff',
          }),
      },
    )
  },

  async updateContact(
    input: UpdateContactInput,
  ): Promise<ConversationContext> {
    const conversationId =
      requireConversationId(
        input.conversationId,
      )

    return await apiRequest<ConversationContext>(
      `/v1/conversations/${encodeURIComponent(
        conversationId,
      )}/contact`,
      {
        method:
          'PATCH',

        body:
          JSON.stringify(
            input.contact,
          ),
      },
    )
  },

  async submitPreferredContactTime(
    input: PreferredContactTimeInput,
  ): Promise<ConversationContext> {
    const conversationId =
      requireConversationId(
        input.conversationId,
      )

    return await apiRequest<ConversationContext>(
      `/v1/conversations/${encodeURIComponent(
        conversationId,
      )}/preferred-contact-time`,
      {
        method:
          'PUT',

        body:
          JSON.stringify({
            preferredContactTime:
              input.preferredContactTime,
          }),
      },
    )
  },
}