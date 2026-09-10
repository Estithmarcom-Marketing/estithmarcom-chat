import assert from 'node:assert/strict'
import test from 'node:test'

import {
  loadArchivedConversationReferences,
  saveArchivedConversationReference,
} from '../src/services/session-storage.ts'

const storage = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem(key: string) {
      return storage.get(key) ?? null
    },
    setItem(key: string, value: string) {
      storage.set(key, value)
    },
    removeItem(key: string) {
      storage.delete(key)
    },
    clear() {
      storage.clear()
    },
    key(index: number) {
      return [...storage.keys()][index] ?? null
    },
    get length() {
      return storage.size
    },
  },
})

test('keeps one active archive reference per conversation', () => {
  storage.clear()

  const reference = {
    conversationId: '11111111-1111-4111-8111-111111111111',
    callbackSubmittedAt: '2026-09-10T10:00:00.000Z',
    expiresAt: '2999-09-10T12:00:00.000Z',
  }

  saveArchivedConversationReference(reference)
  saveArchivedConversationReference(reference)

  assert.deepEqual(
    loadArchivedConversationReferences(),
    [reference],
  )
})

test('removes expired archived conversations', () => {
  storage.clear()

  saveArchivedConversationReference({
    conversationId: '22222222-2222-4222-8222-222222222222',
    callbackSubmittedAt: '2026-09-10T10:00:00.000Z',
    expiresAt: '2020-01-01T00:00:00.000Z',
  })

  assert.deepEqual(
    loadArchivedConversationReferences(),
    [],
  )
  assert.equal(storage.size, 0)
})
