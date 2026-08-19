import { useEffect, useReducer, useState } from 'react'

import type { CustomerContact, SelectedServiceContext } from './types'
import type { ContactField } from './components'

import { ChatWidget, SystemStatesQA } from './components'

import { chatReducer, initialChatState } from './state'
import { clearConversationId, loadConversationId, saveConversationId } from './services'
import { apiChatService, isConversationNotFoundError } from './integrations'

const HUMAN_RESPONSE_TIMEOUT_MS = 60 * 1000

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

function App() {
  const [state, dispatch] = useReducer(chatReducer, initialChatState)
  const [specialistRequested, setSpecialistRequested] = useState(false)
  const [handoffContactField, setHandoffContactField] = useState<ContactField | undefined>(undefined)
  const [pendingHandoffQuestion, setPendingHandoffQuestion] = useState<string | null>(null)
  const [humanTimedOut, setHumanTimedOut] = useState(false)
  const [humanWaitStartedAt, setHumanWaitStartedAt] = useState<number | null>(null)
  const [showSystemStatesQA, setShowSystemStatesQA] = useState(false)

  const missingContactField = specialistRequested
    ? (handoffContactField ?? getMissingContactField(state.context?.contact ?? {}))
    : undefined

  const humanConnected = state.messages.some((message) => message.author === 'human')

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' })
      try {
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
    const isWaitingForHuman = state.context?.mode === 'human' && !humanConnected
    if (!isWaitingForHuman) { setHumanTimedOut(false); setHumanWaitStartedAt(null); return }
    const startedAt = humanWaitStartedAt ?? Date.now()
    if (humanWaitStartedAt === null) setHumanWaitStartedAt(startedAt)
    const remaining = HUMAN_RESPONSE_TIMEOUT_MS - (Date.now() - startedAt)
    if (remaining <= 0) { setHumanTimedOut(true); return }
    const timer = window.setTimeout(() => setHumanTimedOut(true), remaining)
    return () => { window.clearTimeout(timer) }
  }, [state.context?.mode, humanConnected, humanWaitStartedAt])

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
    try {
      const updatedContext = await apiChatService.selectService({
        conversationId: state.context?.conversationId,
        categoryId: service.categoryId, categoryName: service.categoryName,
        platformId: service.platformId, platformName: service.platformName,
        serviceId: service.serviceId, serviceName: service.serviceName,
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
    <main className="min-h-screen bg-surface">
      <ChatWidget
        isOpen={state.isOpen}
        isMinimized={state.isMinimized}
        mode={state.context?.mode ?? 'assistant'}
        humanConnected={humanConnected}
        humanTimedOut={humanTimedOut}
        preferredContactTime={state.context?.preferredContactTime}
        missingContactField={missingContactField}
        messages={state.messages}
        onOpen={() => dispatch({ type: 'OPEN_CHAT' })}
        onClose={() => dispatch({ type: 'CLOSE_CHAT' })}
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
