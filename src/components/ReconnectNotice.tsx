interface ReconnectNoticeProps {
  visible: boolean
}

export function ReconnectNotice({
  visible,
}: ReconnectNoticeProps) {
  if (!visible) return null

  return (
    <div className="flex items-center justify-center gap-2 py-2 mx-4 mb-1 text-xs font-semibold text-green-600 bg-green-50 rounded-xl animate-chat-fade-up" role="status" aria-live="polite">
      ✓ تم استعادة الاتصال
    </div>
  )
}
