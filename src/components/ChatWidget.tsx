import {
  useEffect,
  useReducer,
  useState,
} from 'react'

import type {
  ChatMessage,
  ChatMode,
  SelectedServiceContext,
} from '../types'

import type {
  ContactField,
} from './ContactEnrichment'

import {
  getCategoryById,
  getGroupById,
  getServiceById,
} from '../catalog/catalog-selectors'

import {
  initialNavigationState,
  navigationReducer,
} from '../state'

import {
  HandoffLiveStatus,
} from './HandoffLiveStatus'

import {
  ChatComposer,
  ChatHeader,
  ChatLauncher,
  ContactEnrichment,
  ConversationTimeline,
  HandoffSystemCard,
  MainCategoryList,
  PlatformScreen,
  PreferredContactTime,
  PreferredTimeSaved,
  ServiceConfirmationScreen,
  ServiceListScreen,
  SpecialistButton,
  TypingIndicator,
  WelcomeCard,
} from './index'

interface ChatWidgetProps {
  isOpen: boolean
  isMinimized: boolean

  mode: ChatMode

  humanConnected: boolean
  humanTimedOut: boolean

  preferredContactTime?: string
  missingContactField?: ContactField

  messages: ChatMessage[]

  onOpen: () => void
  onClose: () => void
  onMinimize: () => void
  onRestore: () => void

  onSendMessage: (
    message: string,
  ) => void

  onSelectService: (
    service: SelectedServiceContext,
  ) => Promise<void>

  onRequestSpecialist: () => Promise<void>

  onSubmitContactField: (
    field: ContactField,
    value: string,
  ) => void

  onCancelContactEnrichment:
    () => void

  onSubmitPreferredContactTime: (
    preferredTime: string,
  ) => void
}

export function ChatWidget({
  isOpen,
  isMinimized,
  mode,
  humanConnected,
  humanTimedOut,
  preferredContactTime,
  missingContactField,
  messages,
  onOpen,
  onClose,
  onMinimize,
  onRestore,
  onSendMessage,
  onSelectService,
  onRequestSpecialist,
  onSubmitContactField,
  onCancelContactEnrichment,
  onSubmitPreferredContactTime,
}: ChatWidgetProps) {
  const [
    navigation,
    dispatchNavigation,
  ] = useReducer(
    navigationReducer,
    initialNavigationState,
  )

  const [
    initialGreetingReady,
    setInitialGreetingReady,
  ] = useState(false)

  const [
    initialOptionsTyping,
    setInitialOptionsTyping,
  ] = useState(false)

  const [
    initialOptionsReady,
    setInitialOptionsReady,
  ] = useState(false)

  const [
    visitedCategoryIds,
    setVisitedCategoryIds,
  ] = useState<Set<string>>(
    () => new Set(),
  )

  const [
    skipCurrentCategoryReveal,
    setSkipCurrentCategoryReveal,
  ] = useState(false)

  useEffect(() => {
    if (
      !isOpen ||
      isMinimized ||
      messages.length > 0
    ) {
      setInitialGreetingReady(false)
      setInitialOptionsTyping(false)
      setInitialOptionsReady(false)

      return
    }

    setInitialGreetingReady(false)
    setInitialOptionsTyping(false)
    setInitialOptionsReady(false)

    const greetingTimer =
      window.setTimeout(
        () => {
          setInitialGreetingReady(true)
        },
        1800,
      )

    const optionsTypingTimer =
      window.setTimeout(
        () => {
          setInitialOptionsTyping(true)
        },
        3200,
      )

    const optionsReadyTimer =
      window.setTimeout(
        () => {
          setInitialOptionsTyping(false)
          setInitialOptionsReady(true)
        },
        5000,
      )

    return () => {
      window.clearTimeout(
        greetingTimer,
      )

      window.clearTimeout(
        optionsTypingTimer,
      )

      window.clearTimeout(
        optionsReadyTimer,
      )
    }
  }, [
    isOpen,
    isMinimized,
    messages.length,
  ])

  if (!isOpen) {
    return (
      <ChatLauncher
        onOpen={onOpen}
      />
    )
  }

  if (isMinimized) {
    return (
      <ChatLauncher
        onOpen={onRestore}
      />
    )
  }

  const showWelcome =
    navigation.screen ===
    'welcome'

  const showCategoryGroups =
    navigation.screen ===
      'platforms' &&
    Boolean(
      navigation.categoryId,
    )

  const showServices =
    navigation.screen ===
      'services' &&
    Boolean(
      navigation.categoryId,
    ) &&
    Boolean(
      navigation.platformId,
    )

  const showServiceDetail =
    navigation.screen ===
      'service-detail' &&
    Boolean(
      navigation.categoryId,
    ) &&
    Boolean(
      navigation.platformId,
    ) &&
    Boolean(
      navigation.serviceId,
    )

  const selectedCategory =
    navigation.categoryId
      ? getCategoryById(
          navigation.categoryId,
        )
      : undefined

  const selectedGroup =
    navigation.platformId
      ? getGroupById(
          navigation.platformId,
        )
      : undefined

  const selectedService =
    navigation.serviceId
      ? getServiceById(
          navigation.serviceId,
        )
      : undefined

  const isHandoffPending =
    mode ===
    'handoff_pending'

  const isHumanMode =
    mode ===
    'human'

  const isCollectingContact =
    Boolean(
      missingContactField,
    )

  function handleSelectService(
    serviceId: string,
  ) {
    dispatchNavigation({
      type:
        'SELECT_SERVICE',

      serviceId,
    })

    const categoryId =
      navigation.categoryId

    const groupId =
      navigation.platformId

    if (
      !categoryId ||
      !groupId
    ) {
      return
    }

    const category =
      getCategoryById(
        categoryId,
      )

    const group =
      getGroupById(
        groupId,
      )

    const service =
      getServiceById(
        serviceId,
      )

    if (
      !category ||
      !group ||
      !service
    ) {
      return
    }

    onSelectService({
      categoryId:
        category.id,

      categoryName:
        category.title,

      platformId:
        group.id,

      platformName:
        group.title,

      serviceId:
        service.id,

      serviceName:
        service.title,
    })
  }

  return (
    <section
      className="chat-widget"
      aria-label="محادثة استثماركوم"
    >
      <ChatHeader
        mode={mode}
        humanConnected={
          humanConnected
        }
        onMinimize={
          onMinimize
        }
        onClose={
          onClose
        }
      />

      <div className="chat-widget__body">
        <div className="chat-widget__content">
          <ConversationTimeline
            messages={
              messages
            }
            onSelectSuggestion={(
              value,
            ) => {
              onSendMessage(
                value,
              )
            }}
          />

          {isCollectingContact &&
            missingContactField && (
              <ContactEnrichment
                field={
                  missingContactField
                }
                onSubmit={
                  onSubmitContactField
                }
                onBack={() => {
                  setSkipCurrentCategoryReveal(
                    true,
                  )

                  onCancelContactEnrichment()
                }}
              />
            )}

          {!isCollectingContact &&
            isHandoffPending && (
              <HandoffSystemCard
                variant="waiting"
              />
            )}

          {!isCollectingContact &&
            isHumanMode &&
            !humanConnected &&
            preferredContactTime && (
              <PreferredTimeSaved
                preferredTime={
                  preferredContactTime
                }
              />
            )}

          {!isCollectingContact &&
            isHumanMode &&
            !humanConnected &&
            !preferredContactTime &&
            !humanTimedOut && (
              <>
                <HandoffSystemCard
                  variant="handoff-complete"
                />

                <HandoffLiveStatus />
              </>
            )}

          {!isCollectingContact &&
            isHumanMode &&
            !humanConnected &&
            !preferredContactTime &&
            humanTimedOut && (
              <PreferredContactTime
                onSubmit={
                  onSubmitPreferredContactTime
                }
              />
            )}

          {!isCollectingContact &&
            isHumanMode &&
            humanConnected && (
              <div className="human-connected-card">
                <strong>
                  مختص متصل بالمحادثة
                </strong>

                <p>
                  يمكنك متابعة المحادثة مع الفريق هنا مباشرة.
                </p>
              </div>
            )}

          {!isCollectingContact &&
            !isHandoffPending &&
            !isHumanMode &&
            showWelcome &&
            messages.length === 0 &&
            !initialGreetingReady && (
              <TypingIndicator
                actor="assistant"
              />
            )}

          {!isCollectingContact &&
            !isHandoffPending &&
            !isHumanMode &&
            showWelcome &&
            messages.length === 0 &&
            initialGreetingReady && (
              <>
                <WelcomeCard />

                {initialOptionsTyping && (
                  <TypingIndicator
                    actor="assistant"
                  />
                )}

                {initialOptionsReady && (
                  <MainCategoryList
                    onSelectCategory={(
                      categoryId,
                    ) => {
                      const alreadyVisited =
                        visitedCategoryIds.has(
                          categoryId,
                        )

                      setSkipCurrentCategoryReveal(
                        alreadyVisited,
                      )

                      setVisitedCategoryIds(
                        (current) => {
                          if (
                            current.has(
                              categoryId,
                            )
                          ) {
                            return current
                          }

                          const next =
                            new Set(
                              current,
                            )

                          next.add(
                            categoryId,
                          )

                          return next
                        },
                      )

                      dispatchNavigation({
                        type:
                          'SELECT_CATEGORY',

                        categoryId,
                      })
                    }}
                  />
                )}
              </>
            )}

          {!isCollectingContact &&
            !isHandoffPending &&
            !isHumanMode &&
            showCategoryGroups &&
            navigation.categoryId && (
              <PlatformScreen
                categoryId={
                  navigation.categoryId
                }
                skipConversationalReveal={
                  skipCurrentCategoryReveal
                }
                onBackHome={() => {
                  dispatchNavigation({
                    type:
                      'RESET',
                  })
                }}
                onSelectPlatform={async (
                  platformId,
                ) => {
                  const categoryId =
                    navigation.categoryId

                  if (!categoryId) {
                    return
                  }

                  const category =
                    getCategoryById(
                      categoryId,
                    )

                  const group =
                    getGroupById(
                      platformId,
                    )

                  if (
                    !category ||
                    !group
                  ) {
                    return
                  }

                  await onSelectService({
                    categoryId:
                      category.id,

                    categoryName:
                      category.title,

                    platformId:
                      group.id,

                    platformName:
                      group.title,
                  })

                  await onRequestSpecialist()
                }}
              />
            )}

          {!isCollectingContact &&
            !isHandoffPending &&
            !isHumanMode &&
            showServices &&
            navigation.categoryId &&
            navigation.platformId && (
              <ServiceListScreen
                categoryId={
                  navigation.categoryId
                }
                groupId={
                  navigation.platformId
                }
                onHome={() => {
                  dispatchNavigation({
                    type:
                      'RESET',
                  })
                }}
                onBackToPlatforms={() => {
                  dispatchNavigation({
                    type:
                      'BACK',
                  })
                }}
                onSelectService={
                  handleSelectService
                }
              />
            )}

          {!isCollectingContact &&
            !isHandoffPending &&
            !isHumanMode &&
            showServiceDetail &&
            selectedCategory &&
            selectedGroup &&
            selectedService && (
              <ServiceConfirmationScreen
                serviceName={
                  selectedService.title
                }
                groupName={
                  selectedGroup.title
                }
                onHome={() => {
                  dispatchNavigation({
                    type:
                      'RESET',
                  })
                }}
                onBackToServices={() => {
                  dispatchNavigation({
                    type:
                      'BACK',
                  })
                }}
                onRequestSpecialist={
                  onRequestSpecialist
                }
              />
            )}
        </div>
      </div>

      <div className="chat-widget__footer">
        {!isCollectingContact &&
          !isHandoffPending &&
          !isHumanMode &&
          !showServiceDetail &&
          !(
            showWelcome &&
            messages.length === 0
          ) &&
          !showCategoryGroups &&
          !showServices && (
            <SpecialistButton
              onClick={
                onRequestSpecialist
              }
            />
          )}

        <ChatComposer
          onSend={
            onSendMessage
          }
        />
      </div>
    </section>
  )
}