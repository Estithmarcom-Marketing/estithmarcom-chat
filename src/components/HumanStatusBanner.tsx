interface HumanStatusBannerProps {
  connected?: boolean
}

export function HumanStatusBanner({
  connected = false,
}: HumanStatusBannerProps) {
  return (
    <div
      className={`flex items-start mb-3 animate-chat-fade-in ${
        connected ? 'justify-end' : ''
      }`}
      role="status"
      aria-live="polite"
    >
      {connected ? (
        <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-secondary text-white text-sm leading-relaxed max-w-[80%]">
          <strong className="font-semibold block">مختص متصل</strong>
          <span className="text-white/80 text-[11px]">يمكنك المتابعة مباشرة مع الفريق</span>
        </div>
      ) : (
        <>
          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✦</div>
          <div className="mx-2">
            <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-primary text-white text-sm leading-relaxed max-w-[80%]">
              <strong className="font-semibold block">تم تحويل طلبك</strong>
              <span className="text-white/80 text-[11px]">المحادثة الآن لدى فريق استثماركوم</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
