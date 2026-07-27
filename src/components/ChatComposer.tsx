import {
  useState,
  type FormEvent,
} from 'react'

interface ChatComposerProps {
  disabled?: boolean
  onSend?: (message: string) => void
}

export function ChatComposer({
  disabled = false,
  onSend,
}: ChatComposerProps) {
  const [
    message,
    setMessage,
  ] = useState('')

  const trimmedMessage =
    message.trim()

  const canSend =
    !disabled &&
    trimmedMessage.length > 0

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!canSend) {
      return
    }

    onSend?.(
      trimmedMessage,
    )

    setMessage('')
  }

  return (
    <form
      className={[
        'chat-composer',
        'premium-chat-composer',
        message
          ? 'premium-chat-composer--active'
          : '',
        disabled
          ? 'premium-chat-composer--disabled'
          : '',
      ].join(' ')}
      onSubmit={handleSubmit}
    >
      <span
        className="premium-chat-composer__icon"
        aria-hidden="true"
      >
        ✦
      </span>

      <input
        type="text"
        className="chat-composer__input premium-chat-composer__input"
        value={message}
        onChange={(event) =>
          setMessage(
            event.target.value,
          )
        }
        placeholder="اكتب سؤالك هنا..."
        aria-label="اكتب رسالتك"
        disabled={disabled}
        autoComplete="off"
      />

      <button
        type="submit"
        className="chat-composer__send premium-chat-composer__send"
        disabled={!canSend}
        aria-label="إرسال الرسالة"
      >
        <span aria-hidden="true">
          ←
        </span>
      </button>
    </form>
  )
}
