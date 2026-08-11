import type {
  ChatMessage,
  ConversationContext,
  CustomerContact,
} from '../types'

export interface StartSessionResult {
  context: ConversationContext
  messages: ChatMessage[]
}

export interface LoadConversationResult {
  context: ConversationContext
  messages: ChatMessage[]
}

export interface SendMessageInput {
  conversationId?: string
  content: string
}

export interface SelectServiceInput {
  conversationId?: string

  categoryId: string
  categoryName: string

  platformId: string
  platformName: string

  serviceId?: string
  serviceName?: string
}

export interface RequestSpecialistInput {
  conversationId?: string
  handoffReason?: string
  originalQuestion?: string
  intent?: string
}

export interface UpdateContactInput {
  conversationId?: string
  contact: Partial<CustomerContact>
}

export interface PreferredContactTimeInput {
  conversationId?: string
  preferredContactTime: string
}

export interface ChatService {
  startSession():
    Promise<StartSessionResult>

  loadConversation(
    conversationId: string,
  ): Promise<LoadConversationResult>

  sendMessage(
    input: SendMessageInput,
  ): Promise<ChatMessage>

  selectService(
    input: SelectServiceInput,
  ): Promise<ConversationContext>

  requestSpecialist(
    input: RequestSpecialistInput,
  ): Promise<ConversationContext>

  updateContact(
    input: UpdateContactInput,
  ): Promise<ConversationContext>

  submitPreferredContactTime(
    input: PreferredContactTimeInput,
  ): Promise<ConversationContext>
}