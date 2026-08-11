export function WelcomeCard() {
  return (
    <section
      className="conversation-entry"
      aria-labelledby="welcome-title"
    >
      <article className="conversation-entry__assistant">
        <div className="conversation-entry__identity">
          <span
            className="conversation-entry__avatar"
            aria-hidden="true"
          >
            ✦
          </span>

          <span className="conversation-entry__label">
            مساعد استثماركوم
          </span>
        </div>

        <div className="conversation-entry__bubble">
          <h2
            id="welcome-title"
            className="conversation-entry__title"
          >
            أهلاً بك 👋
          </h2>

          <p>
            أنا مساعد استثماركوم الذكي، وسأساعدك في الوصول
            إلى الخدمة المناسبة بسهولة.
          </p>
        </div>
      </article>
    </section>
  )
}
