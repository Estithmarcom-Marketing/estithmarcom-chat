export function HandoffLiveStatus() {
  return (
    <div className="flex items-start mb-3 animate-handoff-live-enter">
      <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
        ◷
      </div>
      <div className="mx-2">
        <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-primary text-white text-sm leading-relaxed max-w-[80%]">
          <div className="flex items-center gap-2">
            <span>فريق استثماركوم يستلم المحادثة الآن…</span>
            <span className="flex items-center gap-[3px] shrink-0">
              <span className="w-[5px] h-[5px] rounded-full bg-white/60 animate-handoff-live-dot" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/60 animate-handoff-live-dot [animation-delay:140ms]" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/60 animate-handoff-live-dot [animation-delay:280ms]" />
            </span>
          </div>
        </div>
        <span className="text-[10px] text-text-muted mt-1 block px-1">انتظر قليلًا، وسيظهر رد المختص هنا بمجرد استلام المحادثة.</span>
      </div>
    </div>
  )
}
