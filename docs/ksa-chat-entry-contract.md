# KSA website chat entry contract

Protocol version: `1`

The embedded chat accepts a validated category, group, or final-service target.
Display labels are never used as identifiers.

## Runtime message

The parent website sends this message to the chat iframe using the exact chat
origin as the `postMessage` target origin:

```ts
iframe.contentWindow?.postMessage({
  type: 'estithmarcom.chat.open',
  version: 1,
  payload: {
    targetType: 'category',
    targetId: 'financial-services',
    source: 'service_card',
    websiteServiceId: '15',
    pageUrl: '/ar/services/financial-consulting',
    locale: 'ar',
    requestId: crypto.randomUUID(),
  },
}, 'https://chat-stage.estithmarcom.com')
```

The chat announces readiness to each configured allowed parent origin:

```ts
{
  type: 'estithmarcom.chat.ready',
  version: 1,
}
```

## Initial URL

The same target can be supplied when the iframe first loads:

```text
/?chat_target_type=category&chat_target_id=financial-services&chat_source=service_card&website_service_id=15&locale=ar
```

Supported parameters:

- `chat_target_type`: `category`, `group`, or `service`.
- `chat_target_id`: stable ID from the approved chat catalog.
- `chat_source`: optional machine-readable source.
- `website_service_id`: optional numeric KSA website service ID.
- `page_url`: optional relative or HTTP(S) page URL.
- `locale`: optional `ar` or `en`.
- `request_id`: optional correlation ID.

## Resolution behavior

- A category opens its list of groups.
- A non-direct group opens its list of services.
- A direct group opens its final-service confirmation.
- A final service opens its confirmation and persists the selected service.
- Unknown or malformed targets fail closed.
- Runtime messages are accepted only from `VITE_EMBED_ALLOWED_ORIGINS`.
- An existing selected service or human conversation is not overwritten.

The website integration must use the stable catalog IDs supplied by the chat
catalog mapping. It must not infer targets from Arabic or English titles.

## Widget view state

When the chat runs inside an iframe, it sends an exact-origin message whenever
its visible state changes:

```json
{
  "type": "estithmarcom.chat.state",
  "version": 1,
  "payload": {
    "state": "open"
  }
}
```

Supported states are `closed`, `open`, and `minimized`. The parent website must
validate both `event.origin` and `event.source` before resizing the iframe.
Embedded mode is detected from the browsing context; it removes the standalone
page background and minimum width without changing the standalone presentation.
