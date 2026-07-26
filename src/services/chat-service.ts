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
  platformId: string
  serviceId: string
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
  startSession(): Promise<StartSessionResult>

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
    conversationId?: string,
  ): Promise<ConversationContext>

  updateContact(
    input: UpdateContactInput,
  ): Promise<ConversationContext>

  submitPreferredContactTime(
    input: PreferredContactTimeInput,
  ): Promise<ConversationContext>
}
