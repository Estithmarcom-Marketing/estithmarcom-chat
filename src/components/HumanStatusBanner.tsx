interface HumanStatusBannerProps {
  connected?: boolean
}

export function HumanStatusBanner({
  connected = false,
}: HumanStatusBannerProps) {
  return (
    <div
      className={[
        'human-status-banner',
        'premium-human-status',
        connected
          ? 'premium-human-status--connected'
          : 'premium-human-status--waiting',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <span
        className="premium-human-status__dot"
        aria-hidden="true"
      />

      <span className="premium-human-status__content">
        <strong>
          {connected
            ? 'مختص متصل'
            : 'تم تحويل طلبك'}
        </strong>

        <span>
          {connected
            ? 'يمكنك المتابعة مباشرة مع الفريق'
            : 'المحادثة الآن لدى فريق استثماركوم'}
        </span>
      </span>
    </div>
  )
}
