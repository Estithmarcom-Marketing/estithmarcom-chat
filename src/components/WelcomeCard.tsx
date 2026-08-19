export function WelcomeCard() {
  return (
    <div className="flex items-start mb-3 animate-chat-fade-in">
      <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
        ✦
      </div>
      <div className="mx-2 flex-1 min-w-0">
        <span className="text-[11px] font-semibold text-text-muted block mb-1">مساعد استثماركوم</span>
        <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-primary text-white text-sm leading-relaxed max-w-[80%]">
          <h2 id="welcome-title" className="font-semibold mb-1">أهلاً بك 👋</h2>
          <p>
            أنا مساعد استثماركوم الذكي، وسأساعدك في الوصول إلى الخدمة المناسبة بسهولة.
          </p>
        </div>
      </div>
    </div>
  )
}
