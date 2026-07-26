import type {
  ChatMessage,
  ConnectionStatus,
  ConversationContext,
} from '../types'

export interface ChatState {
  isOpen: boolean
  isMinimized: boolean
  isLoading: boolean

  connectionStatus: ConnectionStatus

  context: ConversationContext | null
  messages: ChatMessage[]
}

export const initialChatState: ChatState = {
  isOpen: false,
  isMinimized: false,
  isLoading: false,

  connectionStatus: 'connected',

  context: null,
  messages: [],
}
