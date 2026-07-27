interface PreferredTimeSavedProps {
  preferredTime: string
}

export function PreferredTimeSaved({
  preferredTime,
}: PreferredTimeSavedProps) {
  return (
    <section className="preferred-time-saved premium-preferred-time-saved">
      <div
        className="premium-preferred-time-saved__icon"
        aria-hidden="true"
      >
        ✓
      </div>

      <div className="premium-preferred-time-saved__content">
        <span>
          تم تحديث طلبك
        </span>

        <h2>
          تم تسجيل الوقت المفضل
        </h2>

        <div className="premium-preferred-time-saved__time">
          <span>
            الوقت المناسب
          </span>

          <strong>
            {preferredTime}
          </strong>
        </div>

        <p>
          أصبح الوقت المفضل محفوظًا لدى فريق استثماركوم.
        </p>

        <small>
          ويمكنك الاستمرار بالكتابة هنا في أي وقت.
        </small>
      </div>
    </section>
  )
}
