import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import type { ChatMessage, CustomerContact, SelectedServiceContext } from './types'
import type { ContactField } from './components'

import { ChatWidget, SystemStatesQA } from './components'

import { chatReducer, initialChatState } from './state'
import { clearConversationId, loadArchivedConversationReferences, loadConversationId, saveArchivedConversationReference, saveConversationId } from './services'
import { apiChatService, isConversationNotFoundError } from './integrations'
import { env } from './config/env'
import {
  CHAT_ENTRY_PROTOCOL_VERSION,
  CHAT_ENTRY_READY_MESSAGE,
  createChatEntryStateMessage,
  getChatEntryViewState,
  isAllowedParentOrigin,
  isChatLauncherOpenMessage,
  parseAllowedParentOrigins,
  parseChatEntryMessage,
  parseChatEntrySearch,
} from './embed'
import type { ChatEntryCommand, ChatEntryRequest } from './embed'

const HUMAN_RESPONSE_TIMEOUT_MS = 2 * 60 * 1000
const CALLBACK_HISTORY_RETENTION_MS = 2 * 60 * 60 * 1000
const DEFAULT_SERVICE_COUNTRY_NAME = 'السعودية'

function getMissingContactField(contact: CustomerContact): ContactField | undefined {
  if (!contact.name?.trim()) return 'name'
  if (!contact.phone?.trim()) return 'phone'
  return undefined
}

function isHumanHandoffRequest(content: string): boolean {
  const normalized = content
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[^a-z0-9\u0600-\u06ff\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const patterns = [
    /(?:اريد|ابغى|ابي|ابى|ودي|احتاج|محتاج|عايز|عاوز|بدي|اشتي|نشتي|داير|حاب|حابه|حابب|نحب|بغيت|نبغي|حبيت)\s*(?:اني|ان)?\s*(?:اتواصل|التواصل|تواصل|نتواصل|اكلم|الكلام|اتكلم|التكلم|نتكلم|اتحدث|التحدث|احكي|احجي|احچي|نهدر|نهضر)?\s*(?:مع|ويا|وي)?\s*(?:ال)?(?:موظف|موظفه|مستشار|مستشاره|مسؤول|مسؤوله|مدير|شخص|انسان|احد|حد|دعم|خدمه العملاء)/,
    /(?:حولني|وصلني|اربطني|خليني اتواصل|خلني اتواصل|وصلوني|حولوني)\s*(?:الى|ل|مع)?\s*(?:ال)?(?:موظف|موظفه|مستشار|مسؤول|مدير|خدمه العملاء|الدعم|شخص حقيقي)/,
    /(?:ابي|ابغى|اشتي|بدي|عايز|عاوز|داير|بغيت|نحب|حاب)\s+(?:ال)?(?:موظف|موظفه|مستشار|مسؤول|خدمه العملاء|الدعم)/,
    /(?:خدمه العملاء|دعم بشري|موظف بشري|موظف حقيقي|شخص حقيقي|اكلم الدعم|اتواصل مع الدعم)/,
    /(?:human agent|live agent|customer service|customer support|speak to a human|talk to a human|talk to an agent|connect me to an agent)/i,
    /(?:mitarbeiter sprechen|mit einem mitarbeiter sprechen|kundenservice|kundendienst)/i,
    /(?:abgha|abi|abghi|bghit|3ayz|3awez|badi|m7taj|muhtaj)\s+(?:agent|employee|human|person|mowazaf|موظف)/i,
  ]
  return patterns.some((pattern) => pattern.test(normalized))
}


async function loadArchivedMessagesFromServer(): Promise<ChatMessage[]> {
  const batches = await Promise.all(
    loadArchivedConversationReferences().map(async (reference) => {
      try {
        const result = await apiChatService.loadConversation(reference.conversationId)
        const cutoff = Date.parse(reference.callbackSubmittedAt)
        return result.messages
          .filter((message) => Date.parse(message.createdAt) <= cutoff)
          .map((message) => ({ ...message, contentAttributes: undefined }))
      } catch {
        return []
      }
    }),
  )

  return batches.flat()
}

function App() {
  const [state, dispatch] = useReducer(chatReducer, initialChatState)
  const [specialistRequested, setSpecialistRequested] = useState(false)
  const [handoffContactField, setHandoffContactField] = useState<ContactField | undefined>(undefined)
  const [pendingHandoffQuestion, setPendingHandoffQuestion] = useState<string | null>(null)
  const [humanTimedOut, setHumanTimedOut] = useState(false)
  const [archivedMessages, setArchivedMessages] = useState<ChatMessage[]>([])
  const [showSystemStatesQA, setShowSystemStatesQA] = useState(false)
  const [chatEntryCommand, setChatEntryCommand] = useState<ChatEntryCommand>()
  const nextChatEntryRevision = useRef(0)
  const initialChatEntryQueued = useRef(false)
  const isEmbedded = window.parent !== window

  const queueChatEntry = useCallback((request: ChatEntryRequest) => {
    nextChatEntryRevision.current += 1
    setChatEntryCommand({
      revision: nextChatEntryRevision.current,
      request,
    })
    dispatch({ type: 'OPEN_CHAT' })
  }, [])

  const missingContactField = specialistRequested
    ? (handoffContactField ?? getMissingContactField(state.context?.contact ?? {}))
    : undefined

  const callbackSubmittedAt = Date.parse(state.context?.callbackSubmittedAt ?? '')
  const visibleMessages = Number.isFinite(callbackSubmittedAt) ? state.messages.filter((message) => Date.parse(message.createdAt) <= callbackSubmittedAt) : state.messages
  const humanConnected = visibleMessages.some((message) => message.author === 'human')

  useEffect(() => {
    const expirations =
      loadArchivedConversationReferences()
        .map((reference) =>
          Date.parse(reference.expiresAt),
        )

    if (expirations.length === 0) {
      return
    }

    const delay = Math.max(
      0,
      Math.min(...expirations) - Date.now(),
    )

    const timer = window.setTimeout(() => {
      void loadArchivedMessagesFromServer()
        .then(setArchivedMessages)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [archivedMessages.length])

  useEffect(() => {
    const allowedParentOrigins = parseAllowedParentOrigins(env.embedAllowedOrigins)
    const initialRequest = parseChatEntrySearch(window.location.search)
    if (initialRequest && !initialChatEntryQueued.current) {
      initialChatEntryQueued.current = true
      queueChatEntry(initialRequest)
    }

    function handleParentMessage(event: MessageEvent<unknown>) {
      if (event.source !== window.parent) return
      if (!isAllowedParentOrigin(event.origin, allowedParentOrigins)) return

      if (isChatLauncherOpenMessage(event.data)) {
        void loadArchivedMessagesFromServer()
          .then(setArchivedMessages)
        dispatch({ type: 'OPEN_CHAT' })
        return
      }

      const request = parseChatEntryMessage(event.data)
      if (request) queueChatEntry(request)
    }

    window.addEventListener('message', handleParentMessage)

    if (isEmbedded) {
      for (const origin of allowedParentOrigins) {
        window.parent.postMessage({
          type: CHAT_ENTRY_READY_MESSAGE,
          version: CHAT_ENTRY_PROTOCOL_VERSION,
        }, origin)
      }
    }

    return () => window.removeEventListener('message', handleParentMessage)
  }, [isEmbedded, queueChatEntry])

  useEffect(() => {
    if (!isEmbedded) return
    const allowedParentOrigins = parseAllowedParentOrigins(env.embedAllowedOrigins)
    const message = createChatEntryStateMessage(
      getChatEntryViewState(state.isOpen, state.isMinimized),
    )
    for (const origin of allowedParentOrigins) {
      window.parent.postMessage(message, origin)
    }
  }, [isEmbedded, state.isMinimized, state.isOpen])

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' })
      try {
        const restoredArchivedMessages = await loadArchivedMessagesFromServer()
        const existingConversationId = loadConversationId()
        let result
        if (existingConversationId) {
          try {
            result = await apiChatService.loadConversation(existingConversationId)
          } catch (error) {
            if (!isConversationNotFoundError(error)) throw error
            clearConversationId()
            result = await apiChatService.startSession()
          }
        } else {
          result = await apiChatService.startSession()
        }
        if (cancelled) return
        setArchivedMessages(restoredArchivedMessages)
        if (result.context.conversationId) saveConversationId(result.context.conversationId)
        dispatch({ type: 'SET_CONTEXT', payload: result.context })
        dispatch({ type: 'SET_MESSAGES', payload: result.messages })
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' })
      } catch (error) {
        console.error('Failed to bootstrap chat', error)
        if (!cancelled) dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' })
      } finally {
        if (!cancelled) dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    void bootstrap()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const conversationId = state.context?.conversationId
    if (!conversationId) return
    const activeConversationId = conversationId
    let stopped = false
    let loading = false
    async function refreshConversation() {
      if (stopped || loading) return
      loading = true
      try {
        const result = await apiChatService.loadConversation(activeConversationId)
        if (stopped) return
        dispatch({ type: 'SET_CONTEXT', payload: result.context })
        dispatch({ type: 'SET_MESSAGES', payload: result.messages })
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' })
      } catch (error) {
        console.error('Failed to refresh conversation', error)
        if (!stopped) dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'reconnecting' })
      } finally { loading = false }
    }
    const timer = window.setInterval(() => { void refreshConversation() }, 2500)
    return () => { stopped = true; window.clearInterval(timer) }
  }, [state.context?.conversationId])

  useEffect(() => {
    const isWaitingForHuman =
      state.context?.mode === 'human' &&
      !humanConnected &&
      !state.context.preferredContactTime

    if (!isWaitingForHuman) {
      setHumanTimedOut(false)
      return
    }

    const startedAt =
      Date.parse(
        state.context?.humanModeStartedAt ?? '',
      )

    if (!Number.isFinite(startedAt)) {
      setHumanTimedOut(true)
      return
    }

    const remaining =
      HUMAN_RESPONSE_TIMEOUT_MS -
      (Date.now() - startedAt)

    if (remaining <= 0) {
      setHumanTimedOut(true)
      return
    }

    setHumanTimedOut(false)

    const timer =
      window.setTimeout(
        () => setHumanTimedOut(true),
        remaining,
      )

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    state.context?.mode,
    state.context?.preferredContactTime,
    state.context?.humanModeStartedAt,
    humanConnected,
  ])

  async function handleSendMessage(content: string) {
    const cleanContent = content.trim()
    if (!cleanContent) return
    if (state.context?.mode === 'assistant' && isHumanHandoffRequest(cleanContent)) {
      await handleRequestSpecialist(cleanContent)
      return
    }
    try {
      const message = await apiChatService.sendMessage({ conversationId: state.context?.conversationId, content: cleanContent })
      dispatch({ type: 'ADD_MESSAGE', payload: message })
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' })
    } catch (error) {
      console.error('Failed to send message', error)
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' })
    }
  }

  async function handleSelectService(service: SelectedServiceContext) {
    if (!service.categoryId || !service.categoryName || !service.platformId || !service.platformName) return

    const serviceCountryId = chatEntryCommand
      ? chatEntryCommand.request.serviceCountryId
      : state.context?.service.serviceCountryId

    const serviceCountryName = chatEntryCommand
      ? (
          chatEntryCommand.request.serviceCountryName ??
          DEFAULT_SERVICE_COUNTRY_NAME
        )
      : (
          state.context?.service.serviceCountryName ??
          DEFAULT_SERVICE_COUNTRY_NAME
        )

    try {
      const updatedContext = await apiChatService.selectService({
        conversationId: state.context?.conversationId,
        categoryId: service.categoryId, categoryName: service.categoryName,
        platformId: service.platformId, platformName: service.platformName,
        serviceId: service.serviceId, serviceName: service.serviceName,
        serviceCountryId, serviceCountryName,
      })
      dispatch({ type: 'SET_CONTEXT', payload: updatedContext })
    } catch (error) { console.error('Failed to select service', error) }
  }

  async function completeHandoff(originalQuestion?: string) {
    if (state.context?.mode !== 'assistant') return
    const handoffQuestion = originalQuestion?.trim() || pendingHandoffQuestion?.trim() || 'أريد التحدث مع موظف مختص'
    const context = await apiChatService.requestSpecialist({
      conversationId: state.context?.conversationId,
      handoffReason: 'طلب العميل التحدث مع موظف مختص',
      originalQuestion: handoffQuestion,
      intent: 'human_handoff',
    })
    setPendingHandoffQuestion(null)
    setSpecialistRequested(false)
    setHandoffContactField(undefined)
    dispatch({ type: 'SET_CONTEXT', payload: context })
  }

  async function handleRequestSpecialist(originalQuestion = 'أريد التحدث مع موظف مختص') {
    const cleanQuestion = originalQuestion.trim() || 'أريد التحدث مع موظف مختص'
    setPendingHandoffQuestion(cleanQuestion)
    setSpecialistRequested(true)
    setHandoffContactField('name')
    const currentContact = state.context?.contact ?? {}
    const missingField = getMissingContactField(currentContact)
    void missingField
  }

  async function handleContactField(field: ContactField, value: string) {
    try {
      const updatedContext = await apiChatService.updateContact({
        conversationId: state.context?.conversationId,
        contact: { [field]: value },
      })
      dispatch({ type: 'SET_CONTEXT', payload: updatedContext })
      if (field === 'name') { setHandoffContactField('phone'); return }
      setHandoffContactField(undefined)
      const nextMissingField = getMissingContactField(updatedContext.contact)
      if (!nextMissingField) await completeHandoff(pendingHandoffQuestion ?? undefined)
    } catch (error) { console.error('Failed to update contact', error) }
  }

  async function handleCloseChat() {
    dispatch({ type: 'CLOSE_CHAT' })

    const conversationId =
      state.context?.conversationId
    const submittedAt =
      state.context?.callbackSubmittedAt

    if (!conversationId || !submittedAt) {
      return
    }

    saveArchivedConversationReference({
      conversationId,
      callbackSubmittedAt: submittedAt,
      expiresAt: new Date(
        Date.now() + CALLBACK_HISTORY_RETENTION_MS,
      ).toISOString(),
    })

    clearConversationId()
    setArchivedMessages((current) => [
      ...current,
      ...visibleMessages,
    ])

    try {
      const result =
        await apiChatService.startSession()

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
        type: 'SET_CONNECTION_STATUS',
        payload: 'connected',
      })

      setSpecialistRequested(false)
      setHandoffContactField(undefined)
      setPendingHandoffQuestion(null)
      setHumanTimedOut(false)
    } catch (error) {
      console.error(
        'Failed to start a new conversation',
        error,
      )
    }
  }

  async function handlePreferredContactTime(preferredTime: string) {
    try {
      const currentMode = state.context?.mode
      const updatedContext = await apiChatService.submitPreferredContactTime({
        conversationId: state.context?.conversationId,
        preferredContactTime: preferredTime,
      })
      dispatch({ type: 'SET_CONTEXT', payload: { ...updatedContext, mode: currentMode ?? updatedContext.mode } })
    } catch (error) { console.error('Failed to save preferred contact time', error) }
  }

  if (showSystemStatesQA) {
    return (
      <main className="min-h-screen bg-surface p-4">
        <button
          type="button"
          className="mb-4 px-4 py-2 text-sm font-bold text-secondary border border-secondary/30 bg-white rounded-xl hover:bg-secondary/10 transition-colors cursor-pointer"
          onClick={() => setShowSystemStatesQA(false)}
        >
          العودة إلى الشات
        </button>
        <SystemStatesQA />
      </main>
    )
  }

  return (
    <main className={isEmbedded ? 'min-h-screen bg-transparent' : 'min-h-screen bg-surface'}>
      <ChatWidget
        isOpen={state.isOpen}
        isMinimized={state.isMinimized}
        mode={state.context?.mode ?? 'assistant'}
        customerContact={state.context?.contact}
        selectedServiceContext={state.context?.service}
        humanConnected={humanConnected}
        humanTimedOut={humanTimedOut}
        preferredContactTime={state.context?.preferredContactTime}
        missingContactField={missingContactField}
        archivedMessages={archivedMessages}
        messages={visibleMessages}
        entryCommand={chatEntryCommand}
        entryReady={
          Boolean(state.context?.conversationId) &&
          state.context?.mode === 'assistant'
        }
        onOpen={() => { void loadArchivedMessagesFromServer().then(setArchivedMessages); dispatch({ type: 'OPEN_CHAT' }) }}
        onClose={() => { void handleCloseChat() }}
        onMinimize={() => dispatch({ type: 'MINIMIZE_CHAT' })}
        onRestore={() => dispatch({ type: 'RESTORE_CHAT' })}
        onSendMessage={(message) => { void handleSendMessage(message) }}
        onSelectService={(service) => handleSelectService(service)}
        onRequestSpecialist={() => handleRequestSpecialist()}
        onSubmitContactField={(field, value) => { void handleContactField(field, value) }}
        onCancelContactEnrichment={() => {
          setSpecialistRequested(false)
          setHandoffContactField(undefined)
          setPendingHandoffQuestion(null)
        }}
        onSubmitPreferredContactTime={(preferredTime) => { void handlePreferredContactTime(preferredTime) }}
      />

      {import.meta.env.DEV && (
        <button
          type="button"
          className="fixed bottom-6 start-6 z-50 px-3 py-1.5 text-[10px] font-bold text-text-muted bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => setShowSystemStatesQA(true)}
        >
          System States QA
        </button>
      )}
    </main>
  )
}

export default App
