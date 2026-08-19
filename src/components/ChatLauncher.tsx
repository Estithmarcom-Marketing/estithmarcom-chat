import { MessageSquare } from 'lucide-react'

interface ChatLauncherProps {
  onOpen: () => void
}

export function ChatLauncher({
  onOpen,
}: ChatLauncherProps) {
  return (
    <button
      type="button"
      className="fixed bottom-6 end-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-all duration-300 cursor-pointer"
      onClick={onOpen}
      aria-label="فتح محادثة استثماركوم"
    >
      <MessageSquare className="w-5 h-5 text-white" />
    </button>
  )
}
