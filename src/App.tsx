import {
  useEffect,
  useReducer,
} from 'react'

import {
  chatReducer,
  initialChatState,
} from './state'

import {
  loadConversationId,
  saveConversationId,
} from './services'

import {
  mockChatService,
} from './integrations'

function App() {
  const [state, dispatch] = useReducer(
    chatReducer,
    initialChatState,
  )

  useEffect(() => {
    async function bootstrap() {
      dispatch({
        type: 'SET_LOADING',
        payload: true,
      })

      const existingConversationId =
        loadConversationId()

      const result = existingConversationId
        ? await mockChatService.loadConversation(
            existingConversationId,
          )
        : await mockChatService.startSession()

      if (result.context.conversationId) {
        saveConversationId(
          result.context.conversationId,
        )
      }

      dispatch({
        type: 'SET_CONTEXT',
        payload: result.context,
      })

      dispatch({
        type: 'SET_MESSAGES',
        payload: result.messages,
      })

      dispatch({
        type: 'SET_LOADING',
        payload: false,
      })
    }

    void bootstrap()
  }, [])

  if (state.isLoading || !state.context) {
    return (
      <main>
        جارٍ تجهيز مساعد استثماركوم...
      </main>
    )
  }

  return (
    <main>
      <h1>استثماركوم</h1>

      <p>
        الوضع الحالي:
        {' '}
        {state.context.mode}
      </p>

      <p>
        Conversation:
        {' '}
        {state.context.conversationId}
      </p>
    </main>
  )
}

export default App

