import type {
  ConnectionStatus,
} from '../types'

interface ConnectionStateProps {
  status: ConnectionStatus
}

export function ConnectionState({
  status,
}: ConnectionStateProps) {
  if (status === 'connected') {
    return null
  }

  const content =
    status === 'reconnecting'
      ? {
          title: 'جاري استعادة الاتصال…',
          variant: 'warning',
        }
      : status === 'connecting'
        ? {
            title: 'جاري الاتصال…',
            variant: 'neutral',
          }
        : {
            title: 'انقطع الاتصال مؤقتًا',
            variant: 'error',
          }

  return (
    <div
      className={[
        'connection-state',
        `connection-state--${content.variant}`,
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <span
        className="connection-state__dot"
        aria-hidden="true"
      />

      <span>
        {content.title}
      </span>
    </div>
  )
}
