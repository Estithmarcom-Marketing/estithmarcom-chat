import type {
  ChatMessage,
  ConversationContext,
} from '../types'

import type {
  ChatService,
  LoadConversationResult,
  PreferredContactTimeInput,
  SelectServiceInput,
  SendMessageInput,
  StartSessionResult,
  UpdateContactInput,
} from '../services'

const createInitialContext = (): ConversationContext => ({
  conversationId: 'mock-conversation-1',
  locale: 'ar',
  mode: 'assistant',
  contact: {},
  service: {},
})

let context: ConversationContext = createInitialContext()

let messages: ChatMessage[] = []

export const mockChatService: ChatService = {
  async startSession(): Promise<StartSessionResult> {
    context = createInitialContext()
    messages = []

    return {
      context,
      messages,
    }
  },

  async loadConversation(
    conversationId: string,
  ): Promise<LoadConversationResult> {
    return {
      context: {
        ...context,
        conversationId,
      },
      messages,
    }
  },

  async sendMessage(
    input: SendMessageInput,
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      author: 'customer',
      content: input.content,
      createdAt: new Date().toISOString(),
      status: 'sent',
    }

    messages = [...messages, message]

    return message
  },

  async selectService(
    input: SelectServiceInput,
  ): Promise<ConversationContext> {
    context = {
      ...context,
      conversationId: input.conversationId ?? context.conversationId,
      service: {
        categoryId: input.categoryId,
        platformId: input.platformId,
        serviceId: input.serviceId,
      },
    }

    return context
  },

  async requestSpecialist(
    conversationId?: string,
  ): Promise<ConversationContext> {
    context = {
      ...context,
      conversationId: conversationId ?? context.conversationId,
      mode: 'handoff_pending',
    }

    return context
  },

  async updateContact(
    input: UpdateContactInput,
  ): Promise<ConversationContext> {
    context = {
      ...context,
      conversationId: input.conversationId ?? context.conversationId,
      contact: {
        ...context.contact,
        ...input.contact,
      },
    }

    return context
  },

  async submitPreferredContactTime(
    input: PreferredContactTimeInput,
  ): Promise<ConversationContext> {
    context = {
      ...context,
      conversationId: input.conversationId ?? context.conversationId,
      preferredContactTime: input.preferredContactTime,
    }

    return context
  },
}
