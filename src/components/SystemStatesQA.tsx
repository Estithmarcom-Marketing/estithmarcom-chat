import { ConnectionState, EmptyState, LoadingState, ReconnectNotice, SendError, TypingIndicator } from './index'

export function SystemStatesQA() {
  return (
    <section className="flex flex-col gap-6 p-6 max-w-lg mx-auto" aria-label="معاينة حالات النظام">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-text-muted">Loading</h2>
        <LoadingState />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-text-muted">Connection Lost</h2>
        <ConnectionState status="disconnected" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-text-muted">Reconnecting</h2>
        <ConnectionState status="reconnecting" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-text-muted">Connection Restored</h2>
        <ReconnectNotice visible />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-text-muted">Send Error</h2>
        <SendError onRetry={() => undefined} />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-text-muted">Assistant Typing</h2>
        <TypingIndicator actor="assistant" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-text-muted">Human Typing</h2>
        <TypingIndicator actor="human" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-text-muted">Empty / Load Failure</h2>
        <EmptyState onRetry={() => undefined} onRequestSpecialist={() => undefined} />
      </div>
    </section>
  )
}
