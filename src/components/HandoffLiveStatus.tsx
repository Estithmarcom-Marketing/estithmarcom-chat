export function HandoffLiveStatus() {
  return (
    <div
      className="handoff-live-status handoff-live-status--active"
      role="status"
      aria-live="polite"
    >
      <span
        className="handoff-live-status__typing"
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </span>

      <div className="handoff-live-status__content">
        <strong>
          فريق استثماركوم يستلم المحادثة الآن…
        </strong>

        <span>
          انتظر قليلًا، وسيظهر رد المختص هنا بمجرد استلام المحادثة.
        </span>
      </div>
    </div>
  )
}
