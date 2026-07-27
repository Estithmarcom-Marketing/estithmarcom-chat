import {
  brandConfig,
} from '../config/brand'

export function WelcomeCard() {
  return (
    <section
      className="welcome-card premium-welcome"
      aria-labelledby="welcome-title"
    >
      <div className="premium-welcome__glow" />

      <div
        className="premium-welcome__icon"
        aria-hidden="true"
      >
        <span>
          ✦
        </span>
      </div>

      <div className="premium-welcome__content">
        <span className="premium-welcome__eyebrow">
          أهلاً وسهلاً
        </span>

        <h2
          id="welcome-title"
          className="premium-welcome__title"
        >
          {brandConfig.welcomeTitle}
        </h2>

        <p className="premium-welcome__message">
          {brandConfig.welcomeMessage}
        </p>

        <div className="premium-welcome__trust">
          <span>
            ✓ اختيار واضح
          </span>

          <span>
            ✓ تحويل سريع للمختص
          </span>
        </div>
      </div>
    </section>
  )
}
