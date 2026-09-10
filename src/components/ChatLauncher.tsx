import { useEffect, useState } from 'react'
import { MessageSquare, X } from 'lucide-react'

interface ChatLauncherProps {
  onOpen: () => void
  showGreeting?: boolean
}

const GREETING_TEXT =
  'مرحبًا، هل تحتاج إلى مساعدة؟'

const GREETING_INITIAL_DELAY_MS = 500
const GREETING_CHARACTER_DELAY_MS = 70
const GREETING_HOLD_MS = 2600
const GREETING_HIDDEN_MS = 700

export function ChatLauncher({
  onOpen,
  showGreeting = false,
}: ChatLauncherProps) {
  const [
    isGreetingVisible,
    setIsGreetingVisible,
  ] = useState(true)

  const [
    displayedGreeting,
    setDisplayedGreeting,
  ] = useState('')

  const [
    isGreetingCycleVisible,
    setIsGreetingCycleVisible,
  ] = useState(false)

  const shouldShowGreeting =
    showGreeting && isGreetingVisible

  useEffect(() => {
    if (!shouldShowGreeting) return

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

    if (prefersReducedMotion) {
      setDisplayedGreeting(GREETING_TEXT)
      setIsGreetingCycleVisible(true)
      return
    }

    let cancelled = false
    let timerId: number | undefined

    function schedule(
      callback: () => void,
      delay: number,
    ) {
      timerId = window.setTimeout(() => {
        if (!cancelled) callback()
      }, delay)
    }

    function hideGreeting() {
      setIsGreetingCycleVisible(false)

      schedule(
        startTyping,
        GREETING_HIDDEN_MS,
      )
    }

    function startTyping() {
      let characterIndex = 0

      setDisplayedGreeting('')
      setIsGreetingCycleVisible(true)

      function typeNextCharacter() {
        characterIndex += 1

        setDisplayedGreeting(
          GREETING_TEXT.slice(
            0,
            characterIndex,
          ),
        )

        if (
          characterIndex <
          GREETING_TEXT.length
        ) {
          schedule(
            typeNextCharacter,
            GREETING_CHARACTER_DELAY_MS,
          )
          return
        }

        schedule(
          hideGreeting,
          GREETING_HOLD_MS,
        )
      }

      schedule(
        typeNextCharacter,
        250,
      )
    }

    setDisplayedGreeting('')
    setIsGreetingCycleVisible(false)

    schedule(
      startTyping,
      GREETING_INITIAL_DELAY_MS,
    )

    return () => {
      cancelled = true

      if (timerId !== undefined) {
        window.clearTimeout(timerId)
      }
    }
  }, [shouldShowGreeting])

  const isTyping =
    displayedGreeting.length <
    GREETING_TEXT.length

  return (
    <div
      className="fixed bottom-5 end-5 sm:bottom-6 sm:end-6 z-50 flex flex-col items-end gap-2"
    >
      {shouldShowGreeting && (
        <div
          className={[
            'flex items-center gap-2',
            'transition-all duration-300',
            isGreetingCycleVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-1 pointer-events-none',
          ].join(' ')}
        >
          <button
            type="button"
            className="w-[230px] min-h-10 max-w-[calc(100vw-6.5rem)] rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-[0_10px_30px_rgba(15,23,42,0.18)] border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={onOpen}
            aria-label={GREETING_TEXT}
            dir="rtl"
          >
            <span className="whitespace-nowrap" aria-hidden="true">
              {displayedGreeting}

              <span
                className={[
                  'inline-block mx-0.5 text-secondary',
                  'transition-opacity',
                  isTyping
                    ? 'opacity-100 animate-pulse'
                    : 'hidden',
                ].join(' ')}
              >
                |
              </span>
            </span>
          </button>

          <button
            type="button"
            className="w-10 h-10 shrink-0 rounded-full bg-white text-gray-600 shadow-[0_8px_24px_rgba(15,23,42,0.16)] border border-gray-100 flex items-center justify-center hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() =>
              setIsGreetingVisible(false)
            }
            aria-label="إخفاء رسالة الترحيب"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <button
        type="button"
        className="w-14 h-14 rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.24)] flex items-center justify-center bg-secondary hover:bg-secondary/85 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        onClick={onOpen}
        aria-label="فتح محادثة استثماركوم"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>
    </div>
  )
}
