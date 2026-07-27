interface ReconnectNoticeProps {
  visible: boolean
}

export function ReconnectNotice({
  visible,
}: ReconnectNoticeProps) {
  if (!visible) {
    return null
  }

  return (
    <div
      className="reconnect-notice"
      role="status"
      aria-live="polite"
    >
      ✓ تم استعادة الاتصال
    </div>
  )
}
