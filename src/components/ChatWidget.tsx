import {
  useReducer,
} from 'react'

import type {
  ChatMessage,
  ChatMode,
} from '../types'

import type {
  ContactField,
} from './ContactEnrichment'

import {
  initialNavigationState,
  navigationReducer,
} from '../state'

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
  WelcomeCard,
} from './index'

const mockServiceNames: Record<string, string> = {
  'issue-residency': 'إصدار إقامة',
  'renew-residency': 'تجديد إقامة',
  'exit-reentry': 'تأشيرة خروج وعودة',
  'final-exit': 'خروج نهائي',
}

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

  onRequestSpecialist: () => void

  onSubmitContactField: (
    field: ContactField,
    value: string,
  ) => void

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
  onRequestSpecialist,
  onSubmitContactField,
  onSubmitPreferredContactTime,
}: ChatWidgetProps) {
  const [
    navigation,
    dispatchNavigation,
  ] = useReducer(
    navigationReducer,
    initialNavigationState,
  )

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
    navigation.screen === 'welcome'

  const showGovernmentPlatforms =
    navigation.screen === 'platforms' &&
    navigation.categoryId ===
      'government-services'

  const showMuqeemServices =
    navigation.screen === 'services' &&
    navigation.platformId === 'muqeem'

  const showServiceDetail =
    navigation.screen ===
      'service-detail' &&
    navigation.platformId === 'muqeem' &&
    Boolean(navigation.serviceId)

  const selectedServiceName =
    navigation.serviceId
      ? mockServiceNames[
          navigation.serviceId
        ]
      : undefined

  const isHandoffPending =
    mode === 'handoff_pending'

  const isHumanMode =
    mode === 'human'

  const isCollectingContact =
    Boolean(missingContactField)

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
            messages={messages}
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
              />
            )}

          {!isCollectingContact &&
            isHandoffPending &&
            !humanTimedOut && (
              <HandoffSystemCard
                variant="handoff-complete"
              />
            )}

          {!isCollectingContact &&
            isHandoffPending &&
            humanTimedOut &&
            !preferredContactTime && (
              <PreferredContactTime
                onSubmit={
                  onSubmitPreferredContactTime
                }
              />
            )}

          {!isCollectingContact &&
            isHandoffPending &&
            humanTimedOut &&
            preferredContactTime && (
              <PreferredTimeSaved
                preferredTime={
                  preferredContactTime
                }
              />
            )}

          {!isCollectingContact &&
            isHumanMode &&
            !humanConnected && (
              <HandoffSystemCard
                variant="waiting"
              />
            )}

          {!isCollectingContact &&
            isHumanMode &&
            humanConnected && (
              <div className="human-connected-card">
                <strong>
                  تم اتصال المختص بالمحادثة
                </strong>

                <p>
                  يمكنك متابعة المحادثة هنا مباشرة.
                </p>
              </div>
            )}

          {!isCollectingContact &&
            !isHandoffPending &&
            !isHumanMode &&
            showWelcome && (
              <>
                <WelcomeCard />

                <MainCategoryList
                  onSelectCategory={(
                    categoryId,
                  ) => {
                    dispatchNavigation({
                      type:
                        'SELECT_CATEGORY',
                      categoryId,
                    })
                  }}
                />
              </>
            )}

          {!isCollectingContact &&
            !isHandoffPending &&
            !isHumanMode &&
            showGovernmentPlatforms && (
              <PlatformScreen
                onBackHome={() => {
                  dispatchNavigation({
                    type: 'RESET',
                  })
                }}
                onSelectPlatform={(
                  platformId,
                ) => {
                  dispatchNavigation({
                    type:
                      'SELECT_PLATFORM',
                    platformId,
                  })
                }}
              />
            )}

          {!isCollectingContact &&
            !isHandoffPending &&
            !isHumanMode &&
            showMuqeemServices && (
              <ServiceListScreen
                onHome={() => {
                  dispatchNavigation({
                    type: 'RESET',
                  })
                }}
                onBackToPlatforms={() => {
                  dispatchNavigation({
                    type: 'BACK',
                  })
                }}
                onSelectService={(
                  serviceId,
                ) => {
                  dispatchNavigation({
                    type:
                      'SELECT_SERVICE',
                    serviceId,
                  })
                }}
              />
            )}

          {!isCollectingContact &&
            !isHandoffPending &&
            !isHumanMode &&
            showServiceDetail &&
            selectedServiceName && (
              <ServiceConfirmationScreen
                serviceName={
                  selectedServiceName
                }
                platformName="مقيم"
                onHome={() => {
                  dispatchNavigation({
                    type: 'RESET',
                  })
                }}
                onBackToServices={() => {
                  dispatchNavigation({
                    type: 'BACK',
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
          !showServiceDetail && (
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


