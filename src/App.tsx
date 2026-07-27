import {
  useEffect,
  useReducer,
  useState,
} from 'react'

import type {
  CustomerContact,
  SelectedServiceContext,
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
  clearConversationId,
  loadConversationId,
  saveConversationId,
} from './services'

import {
  apiChatService,
  isConversationNotFoundError,
} from './integrations'

const HUMAN_RESPONSE_TIMEOUT_MS =
  60 * 1000

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
    specialistRequested,
    setSpecialistRequested,
  ] = useState(false)

  const [
    humanTimedOut,
    setHumanTimedOut,
  ] = useState(false)

  const [
    humanWaitStartedAt,
    setHumanWaitStartedAt,
  ] = useState<number | null>(null)

  const [
    showSystemStatesQA,
    setShowSystemStatesQA,
  ] = useState(false)

  const missingContactField =
    specialistRequested
      ? getMissingContactField(
          state.context?.contact ??
            {},
        )
      : undefined

  const humanConnected =
    state.messages.some(
      (message) =>
        message.author ===
        'human',
    )

  useEffect(() => {
    let cancelled =
      false

    async function bootstrap() {
      dispatch({
        type:
          'SET_LOADING',

        payload:
          true,
      })

      dispatch({
        type:
          'SET_CONNECTION_STATUS',

        payload:
          'connecting',
      })

      try {
        const existingConversationId =
          loadConversationId()

        let result

        if (
          existingConversationId
        ) {
          try {
            result =
              await apiChatService.loadConversation(
                existingConversationId,
              )
          } catch (error) {
            if (
              !isConversationNotFoundError(
                error,
              )
            ) {
              throw error
            }

            clearConversationId()

            result =
              await apiChatService.startSession()
          }
        } else {
          result =
            await apiChatService.startSession()
        }

        if (cancelled) {
          return
        }

        if (
          result.context
            .conversationId
        ) {
          saveConversationId(
            result.context
              .conversationId,
          )
        }

        dispatch({
          type:
            'SET_CONTEXT',

          payload:
            result.context,
        })

        dispatch({
          type:
            'SET_MESSAGES',

          payload:
            result.messages,
        })

        dispatch({
          type:
            'SET_CONNECTION_STATUS',

          payload:
            'connected',
        })
      } catch (error) {
        console.error(
          'Failed to bootstrap chat',
          error,
        )

        if (!cancelled) {
          dispatch({
            type:
              'SET_CONNECTION_STATUS',

            payload:
              'disconnected',
          })
        }
      } finally {
        if (!cancelled) {
          dispatch({
            type:
              'SET_LOADING',

            payload:
              false,
          })
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled =
        true
    }
  }, [])

  useEffect(() => {
    const conversationId =
      state.context
        ?.conversationId

    if (!conversationId) {
      return
    }

    const activeConversationId =
      conversationId

    let stopped =
      false

    let loading =
      false

    async function refreshConversation() {
      if (
        stopped ||
        loading
      ) {
        return
      }

      loading =
        true

      try {
        const result =
          await apiChatService.loadConversation(
            activeConversationId,
          )

        if (stopped) {
          return
        }

        dispatch({
          type:
            'SET_CONTEXT',

          payload:
            result.context,
        })

        dispatch({
          type:
            'SET_MESSAGES',

          payload:
            result.messages,
        })

        dispatch({
          type:
            'SET_CONNECTION_STATUS',

          payload:
            'connected',
        })
      } catch (error) {
        console.error(
          'Failed to refresh conversation',
          error,
        )

        if (!stopped) {
          dispatch({
            type:
              'SET_CONNECTION_STATUS',

            payload:
              'reconnecting',
          })
        }
      } finally {
        loading =
          false
      }
    }

    const timer =
      window.setInterval(
        () => {
          void refreshConversation()
        },
        2500,
      )

    return () => {
      stopped =
        true

      window.clearInterval(
        timer,
      )
    }
  }, [
    state.context
      ?.conversationId,
  ])

  /*
   * Human response timeout.
   *
   * As soon as the conversation enters human mode,
   * start a one-minute waiting window.
   *
   * If a real human message arrives before the timeout,
   * cancel the timeout immediately.
   */
  useEffect(() => {
    const isWaitingForHuman =
      state.context?.mode ===
        'human' &&
      !humanConnected

    if (!isWaitingForHuman) {
      setHumanTimedOut(false)
      setHumanWaitStartedAt(null)

      return
    }

    const startedAt =
      humanWaitStartedAt ??
      Date.now()

    if (
      humanWaitStartedAt === null
    ) {
      setHumanWaitStartedAt(
        startedAt,
      )
    }

    const elapsed =
      Date.now() -
      startedAt

    const remaining =
      HUMAN_RESPONSE_TIMEOUT_MS -
      elapsed

    if (remaining <= 0) {
      setHumanTimedOut(true)
      return
    }

    const timer =
      window.setTimeout(
        () => {
          setHumanTimedOut(true)
        },
        remaining,
      )

    return () => {
      window.clearTimeout(
        timer,
      )
    }
  }, [
    state.context?.mode,
    humanConnected,
    humanWaitStartedAt,
  ])

  async function handleSendMessage(
    content: string,
  ) {
    try {
      const message =
        await apiChatService.sendMessage({
          conversationId:
            state.context
              ?.conversationId,

          content,
        })

      dispatch({
        type:
          'ADD_MESSAGE',

        payload:
          message,
      })

      dispatch({
        type:
          'SET_CONNECTION_STATUS',

        payload:
          'connected',
      })
    } catch (error) {
      console.error(
        'Failed to send message',
        error,
      )

      dispatch({
        type:
          'SET_CONNECTION_STATUS',

        payload:
          'disconnected',
      })
    }
  }

  async function handleSelectService(
    service: SelectedServiceContext,
  ) {
    if (
      !service.categoryId ||
      !service.categoryName ||
      !service.platformId ||
      !service.platformName ||
      !service.serviceId ||
      !service.serviceName
    ) {
      return
    }

    try {
      const updatedContext =
        await apiChatService.selectService({
          conversationId:
            state.context
              ?.conversationId,

          categoryId:
            service.categoryId,

          categoryName:
            service.categoryName,

          platformId:
            service.platformId,

          platformName:
            service.platformName,

          serviceId:
            service.serviceId,

          serviceName:
            service.serviceName,
        })

      dispatch({
        type:
          'SET_CONTEXT',

        payload:
          updatedContext,
      })
    } catch (error) {
      console.error(
        'Failed to select service',
        error,
      )
    }
  }

  async function completeHandoff() {
    if (
      state.context?.mode !==
      'assistant'
    ) {
      return
    }

    const context =
      await apiChatService.requestSpecialist({
        conversationId:
          state.context
            ?.conversationId,

        handoffReason:
          'طلب العميل التحدث مع موظف مختص',

        originalQuestion:
          'أريد التحدث مع موظف مختص',

        intent:
          'human_handoff',
      })

    dispatch({
      type:
        'SET_CONTEXT',

      payload:
        context,
    })
  }

  async function handleRequestSpecialist() {
    setSpecialistRequested(
      true,
    )

    const currentContact =
      state.context?.contact ??
      {}

    const missingField =
      getMissingContactField(
        currentContact,
      )

    if (!missingField) {
      try {
        await completeHandoff()
      } catch (error) {
        console.error(
          'Failed to request specialist',
          error,
        )
      }
    }
  }

  async function handleContactField(
    field: ContactField,
    value: string,
  ) {
    try {
      const updatedContext =
        await apiChatService.updateContact({
          conversationId:
            state.context
              ?.conversationId,

          contact: {
            [field]:
              value,
          },
        })

      dispatch({
        type:
          'SET_CONTEXT',

        payload:
          updatedContext,
      })

      const nextMissingField =
        getMissingContactField(
          updatedContext.contact,
        )

      if (!nextMissingField) {
        await completeHandoff()
      }
    } catch (error) {
      console.error(
        'Failed to update contact',
        error,
      )
    }
  }

  async function handlePreferredContactTime(
    preferredTime: string,
  ) {
    try {
      const currentMode =
        state.context?.mode

      const updatedContext =
        await apiChatService
          .submitPreferredContactTime({
            conversationId:
              state.context
                ?.conversationId,

            preferredContactTime:
              preferredTime,
          })

      dispatch({
        type:
          'SET_CONTEXT',

        payload: {
          ...updatedContext,

          mode:
            currentMode ??
            updatedContext.mode,
        },
      })
    } catch (error) {
      console.error(
        'Failed to save preferred contact time',
        error,
      )
    }
  }
  if (showSystemStatesQA) {
    return (
      <main className="system-states-page">
        <button
          type="button"
          className="system-states-page__back"
          onClick={() =>
            setShowSystemStatesQA(
              false,
            )
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
        isOpen={
          state.isOpen
        }
        isMinimized={
          state.isMinimized
        }
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
          state.context
            ?.preferredContactTime
        }
        missingContactField={
          missingContactField
        }
        messages={
          state.messages
        }
        onOpen={() =>
          dispatch({
            type:
              'OPEN_CHAT',
          })
        }
        onClose={() =>
          dispatch({
            type:
              'CLOSE_CHAT',
          })
        }
        onMinimize={() =>
          dispatch({
            type:
              'MINIMIZE_CHAT',
          })
        }
        onRestore={() =>
          dispatch({
            type:
              'RESTORE_CHAT',
          })
        }
        onSendMessage={(message) => {
          void handleSendMessage(
            message,
          )
        }}
        onSelectService={(service) => {
          void handleSelectService(
            service,
          )
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
        onSubmitPreferredContactTime={(
          preferredTime,
        ) => {
          void handlePreferredContactTime(
            preferredTime,
          )
        }}
      />

      {import.meta.env.DEV && (
        <button
          type="button"
          className="mock-system-states-trigger"
          onClick={() =>
            setShowSystemStatesQA(
              true,
            )
          }
        >
          System States QA
        </button>
      )}
    </main>
  )
}

export default App