interface ChatLauncherProps {
  onOpen: () => void
}

export function ChatLauncher({
  onOpen,
}: ChatLauncherProps) {
  return (
    <button
      type="button"
      className="chat-launcher"
      onClick={onOpen}
      aria-label="فتح محادثة استثماركوم"
    >
      <span
        className="chat-launcher__icon"
        aria-hidden="true"
      >
        💬
      </span>

      <span className="chat-launcher__label">
        تحدث معنا
      </span>
    </button>
  )
}
