import {
  ConnectionState,
  EmptyState,
  LoadingState,
  ReconnectNotice,
  SendError,
  TypingIndicator,
} from './index'

export function SystemStatesQA() {
  return (
    <section
      className="system-states-qa"
      aria-label="معاينة حالات النظام"
    >
      <div className="system-states-qa__section">
        <h2>Loading</h2>

        <LoadingState />
      </div>

      <div className="system-states-qa__section">
        <h2>Connection Lost</h2>

        <ConnectionState
          status="disconnected"
        />
      </div>

      <div className="system-states-qa__section">
        <h2>Reconnecting</h2>

        <ConnectionState
          status="reconnecting"
        />
      </div>

      <div className="system-states-qa__section">
        <h2>Connection Restored</h2>

        <ReconnectNotice
          visible
        />
      </div>

      <div className="system-states-qa__section">
        <h2>Send Error</h2>

        <SendError
          onRetry={() => undefined}
        />
      </div>

      <div className="system-states-qa__section">
        <h2>Assistant Typing</h2>

        <TypingIndicator
          actor="assistant"
        />
      </div>

      <div className="system-states-qa__section">
        <h2>Human Typing</h2>

        <TypingIndicator
          actor="human"
        />
      </div>

      <div className="system-states-qa__section">
        <h2>Empty / Load Failure</h2>

        <EmptyState
          onRetry={() => undefined}
          onRequestSpecialist={() => undefined}
        />
      </div>
    </section>
  )
}
