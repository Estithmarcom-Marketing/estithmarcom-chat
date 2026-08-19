import logo from '../assets/logo.png'

export type TypingActor = 'assistant' | 'human'

interface TypingIndicatorProps {
  actor: TypingActor
}

export function TypingIndicator({
  actor,
}: TypingIndicatorProps) {
  const isHuman = actor === 'human'
  const text = isHuman
    ? 'المختص يكتب…'
    : 'مساعد استثماركوم يجهز الخطوة التالية…'
  return (
    <div className="flex items-start mb-3 animate-chat-fade-in" role="status" aria-live="polite">
      {isHuman ? (
        <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">👤</div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-primary shrink-0 mt-0.5 overflow-hidden flex items-center justify-center">
          <img src={logo} alt="logo" className="w-5 h-5 object-contain" />
        </div>
      )}
      <div className="mx-2">
        <span className="text-[11px] font-semibold text-text-muted block mb-1">
          {isHuman ? 'فريق استثماركوم' : 'مساعد استثماركوم'}
        </span>
        <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-primary text-white text-sm leading-relaxed">
          <div className="flex items-center gap-2">
            <span>{text}</span>
            <span className="flex items-center gap-[3px]">
              <span className="w-[5px] h-[5px] rounded-full bg-white/60 animate-typing-dot" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/60 animate-typing-dot [animation-delay:140ms]" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/60 animate-typing-dot [animation-delay:280ms]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
