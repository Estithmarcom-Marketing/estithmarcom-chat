import {
  useEffect,
  useReducer,
  useState,
} from 'react'

import type {
  CustomerContact,
} from './types'

import type {
  ContactField,
} from './components'

import {
  ChatWidget,
  SystemStatesQA,
} from './components'

import {
  chatReducer,
  initialChatState,
} from './state'

import {
  loadConversationId,
  saveConversationId,
} from './services'

import {
  connectMockHuman,
  createMockAssistantReply,
  createMockHumanReply,
  createMockSystemMessage,
  mockChatService,
} from './integrations'

function getMissingContactField(
  contact: CustomerContact,
): ContactField | undefined {
  if (!contact.name?.trim()) {
    return 'name'
  }

  if (!contact.phone?.trim()) {
    return 'phone'
  }

  return undefined
}

function App() {
  const [
    state,
    dispatch,
  ] = useReducer(
    chatReducer,
    initialChatState,
  )

  const [
    humanConnected,
    setHumanConnected,
  ] = useState(false)

  const [
    humanTimedOut,
    setHumanTimedOut,
  ] = useState(false)

  const [
    preferredContactTime,
    setPreferredContactTime,
  ] = useState<string>()

  const [
    specialistRequested,
    setSpecialistRequested,
  ] = useState(false)

  const [
    showSystemStatesQA,
    setShowSystemStatesQA,
  ] = useState(false)

  const missingContactField =
    specialistRequested
      ? getMissingContactField(
          state.context?.contact ?? {},
        )
      : undefined

  useEffect(() => {
    async function bootstrap() {
      dispatch({
        type: 'SET_LOADING',
        payload: true,
      })

      const existingConversationId =
        loadConversationId()

      const result =
        existingConversationId
          ? await mockChatService.loadConversation(
              existingConversationId,
            )
          : await mockChatService.startSession()

      if (
        result.context.conversationId
      ) {
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

  async function handleSendMessage(
    content: string,
  ) {
    const message =
      await mockChatService.sendMessage({
        conversationId:
          state.context?.conversationId,
        content,
      })

    dispatch({
      type: 'ADD_MESSAGE',
      payload: message,
    })

    if (
      state.context?.mode === 'assistant'
    ) {
      const assistantReply =
        createMockAssistantReply(
          'فهمت طلبك. سأساعدك في الوصول للخدمة المناسبة.',
        )

      dispatch({
        type: 'ADD_MESSAGE',
        payload: assistantReply,
      })
    }
  }

  async function completeMockHandoff() {
    const context =
      await mockChatService.requestSpecialist(
        state.context?.conversationId,
      )

    dispatch({
      type: 'SET_CONTEXT',
      payload: context,
    })

    const systemMessage =
      createMockSystemMessage(
        'تم تحويل طلبك إلى فريق استثماركوم.',
      )

    dispatch({
      type: 'ADD_MESSAGE',
      payload: systemMessage,
    })
  }

  async function handleRequestSpecialist() {
    setSpecialistRequested(true)

    const currentContact =
      state.context?.contact ?? {}

    const missingField =
      getMissingContactField(
        currentContact,
      )

    if (!missingField) {
      await completeMockHandoff()
    }
  }

  async function handleContactField(
    field: ContactField,
    value: string,
  ) {
    const updatedContext =
      await mockChatService.updateContact({
        conversationId:
          state.context?.conversationId,

        contact: {
          [field]: value,
        },
      })

    dispatch({
      type: 'SET_CONTEXT',
      payload: updatedContext,
    })

    const nextMissingField =
      getMissingContactField(
        updatedContext.contact,
      )

    if (!nextMissingField) {
      await completeMockHandoff()
    }
  }

  function handlePreferredContactTime(
    preferredTime: string,
  ) {
    setPreferredContactTime(
      preferredTime,
    )
  }

  function handleMockHumanReply() {
    const context =
      connectMockHuman()

    setHumanConnected(true)
    setHumanTimedOut(false)

    dispatch({
      type: 'SET_CONTEXT',
      payload: context,
    })

    const reply =
      createMockHumanReply(
        'أهلًا بك، معك أحد مختصي استثماركوم. كيف أقدر أساعدك؟',
      )

    dispatch({
      type: 'ADD_MESSAGE',
      payload: reply,
    })
  }

  if (showSystemStatesQA) {
    return (
      <main className="system-states-page">
        <button
          type="button"
          className="system-states-page__back"
          onClick={() =>
            setShowSystemStatesQA(false)
          }
        >
          العودة إلى الشات
        </button>

        <SystemStatesQA />
      </main>
    )
  }

  return (
    <main className="app-shell">
      <ChatWidget
        isOpen={state.isOpen}
        isMinimized={state.isMinimized}
        mode={
          state.context?.mode ??
          'assistant'
        }
        humanConnected={
          humanConnected
        }
        humanTimedOut={
          humanTimedOut
        }
        preferredContactTime={
          preferredContactTime
        }
        missingContactField={
          missingContactField
        }
        messages={state.messages}
        onOpen={() =>
          dispatch({
            type: 'OPEN_CHAT',
          })
        }
        onClose={() =>
          dispatch({
            type: 'CLOSE_CHAT',
          })
        }
        onMinimize={() =>
          dispatch({
            type: 'MINIMIZE_CHAT',
          })
        }
        onRestore={() =>
          dispatch({
            type: 'RESTORE_CHAT',
          })
        }
        onSendMessage={(message) => {
          void handleSendMessage(message)
        }}
        onRequestSpecialist={() => {
          void handleRequestSpecialist()
        }}
        onSubmitContactField={(
          field,
          value,
        ) => {
          void handleContactField(
            field,
            value,
          )
        }}
        onSubmitPreferredContactTime={
          handlePreferredContactTime
        }
      />

      {import.meta.env.DEV && (
        <button
          type="button"
          className="mock-timeout-trigger"
          onClick={() =>
            setHumanTimedOut(true)
          }
        >
          Mock Human Timeout
        </button>
      )}

      {import.meta.env.DEV && (
        <button
          type="button"
          className="mock-human-trigger"
          onClick={
            handleMockHumanReply
          }
        >
          Mock Human Reply
        </button>
      )}

      {import.meta.env.DEV && (
        <button
          type="button"
          className="mock-system-states-trigger"
          onClick={() =>
            setShowSystemStatesQA(true)
          }
        >
          System States QA
        </button>
      )}
    </main>
  )
}

export default App