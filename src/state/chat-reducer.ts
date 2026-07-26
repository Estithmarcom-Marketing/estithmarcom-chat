import type {
  ChatMessage,
  ConnectionStatus,
  ConversationContext,
} from '../types'

import type { ChatState } from './chat-state'

export type ChatAction =
  | {
      type: 'OPEN_CHAT'
    }
  | {
      type: 'CLOSE_CHAT'
    }
  | {
      type: 'MINIMIZE_CHAT'
    }
  | {
      type: 'RESTORE_CHAT'
    }
  | {
      type: 'SET_LOADING'
      payload: boolean
    }
  | {
      type: 'SET_CONNECTION_STATUS'
      payload: ConnectionStatus
    }
  | {
      type: 'SET_CONTEXT'
      payload: ConversationContext
    }
  | {
      type: 'SET_MESSAGES'
      payload: ChatMessage[]
    }
  | {
      type: 'ADD_MESSAGE'
      payload: ChatMessage
    }

export function chatReducer(
  state: ChatState,
  action: ChatAction,
): ChatState {
  switch (action.type) {
    case 'OPEN_CHAT':
      return {
        ...state,
        isOpen: true,
        isMinimized: false,
      }

    case 'CLOSE_CHAT':
      return {
        ...state,
        isOpen: false,
        isMinimized: false,
      }

    case 'MINIMIZE_CHAT':
      return {
        ...state,
        isMinimized: true,
      }

    case 'RESTORE_CHAT':
      return {
        ...state,
        isOpen: true,
        isMinimized: false,
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
      }

    case 'SET_CONTEXT':
      return {
        ...state,
        context: action.payload,
      }

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      }

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          action.payload,
        ],
      }

    default:
      return state
  }
}
