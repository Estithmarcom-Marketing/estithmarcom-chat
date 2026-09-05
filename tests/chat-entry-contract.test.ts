import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CHAT_ENTRY_OPEN_MESSAGE,
  createChatEntryMessage,
  isAllowedParentOrigin,
  parseAllowedParentOrigins,
  parseChatEntryMessage,
  parseChatEntrySearch,
  resolveChatEntry,
} from '../src/embed/chat-entry-contract.ts'
import {
  catalogCategories,
  catalogGroups,
  catalogServices,
} from '../src/catalog/catalog-data.ts'

const categories = [
  { id: 'financial-services', title: 'الخدمات المالية' },
]

const groups = [
  {
    id: 'financial-consultant',
    categoryId: 'financial-services',
    title: 'مستشار مالي',
    directServiceId: 'EST-FIN-CONS-001',
  },
  {
    id: 'accounting',
    categoryId: 'financial-services',
    title: 'المحاسبة',
  },
]

const services = [
  {
    id: 'EST-FIN-CONS-001',
    categoryId: 'financial-services',
    groupId: 'financial-consultant',
    title: 'مستشار مالي',
  },
]

const catalog = {
  getCategoryById: (id: string) => categories.find((item) => item.id === id),
  getGroupById: (id: string) => groups.find((item) => item.id === id),
  getServiceById: (id: string) => services.find((item) => item.id === id),
}

test('parses a versioned open command', () => {
  const message = createChatEntryMessage({
    targetType: 'category',
    targetId: 'financial-services',
    source: 'service_card',
    websiteServiceId: '15',
    locale: 'ar',
  })

  assert.equal(message.type, CHAT_ENTRY_OPEN_MESSAGE)
  assert.deepEqual(parseChatEntryMessage(message), message.payload)
})

test('rejects unknown versions and malformed identifiers', () => {
  assert.equal(parseChatEntryMessage({
    type: CHAT_ENTRY_OPEN_MESSAGE,
    version: 2,
    payload: { targetType: 'category', targetId: 'financial-services' },
  }), null)

  assert.equal(parseChatEntryMessage({
    type: CHAT_ENTRY_OPEN_MESSAGE,
    version: 1,
    payload: { targetType: 'category', targetId: '<script>' },
  }), null)
})

test('parses a validated initial URL request', () => {
  assert.deepEqual(
    parseChatEntrySearch('?chat_target_type=group&chat_target_id=accounting&chat_source=service_details&website_service_id=20&locale=ar'),
    {
      targetType: 'group',
      targetId: 'accounting',
      source: 'service_details',
      websiteServiceId: '20',
      locale: 'ar',
    },
  )
})

test('uses an exact origin allowlist and rejects wildcards', () => {
  const origins = parseAllowedParentOrigins(
    'https://test.estithmarcom.com, https://test.estithmarcom.com/, *, javascript:alert(1)',
  )

  assert.deepEqual(origins, ['https://test.estithmarcom.com'])
  assert.equal(isAllowedParentOrigin('https://test.estithmarcom.com', origins), true)
  assert.equal(isAllowedParentOrigin('https://estithmarcom.com', origins), false)
})

test('resolves categories and non-direct groups without selecting a service', () => {
  assert.deepEqual(
    resolveChatEntry({ targetType: 'category', targetId: 'financial-services' }, catalog),
    { categoryId: 'financial-services' },
  )

  assert.deepEqual(
    resolveChatEntry({ targetType: 'group', targetId: 'accounting' }, catalog),
    { categoryId: 'financial-services', groupId: 'accounting' },
  )
})

test('resolves direct groups and final services to confirmation context', () => {
  const expected = {
    categoryId: 'financial-services',
    groupId: 'financial-consultant',
    serviceId: 'EST-FIN-CONS-001',
    selectedService: {
      categoryId: 'financial-services',
      categoryName: 'الخدمات المالية',
      platformId: 'financial-consultant',
      platformName: 'مستشار مالي',
      serviceId: 'EST-FIN-CONS-001',
      serviceName: 'مستشار مالي',
    },
  }

  assert.deepEqual(
    resolveChatEntry({ targetType: 'group', targetId: 'financial-consultant' }, catalog),
    expected,
  )
  assert.deepEqual(
    resolveChatEntry({ targetType: 'service', targetId: 'EST-FIN-CONS-001' }, catalog),
    expected,
  )
})

test('fails closed when a target does not exist', () => {
  assert.equal(
    resolveChatEntry({ targetType: 'service', targetId: 'EST-MISSING-001' }, catalog),
    null,
  )
})

test('resolves every approved catalog target with consistent relationships', () => {
  const approvedCatalog = {
    getCategoryById: (id: string) => catalogCategories.find((item) => item.id === id),
    getGroupById: (id: string) => catalogGroups.find((item) => item.id === id),
    getServiceById: (id: string) => catalogServices.find((item) => item.id === id),
  }

  for (const category of catalogCategories) {
    assert.deepEqual(
      resolveChatEntry({ targetType: 'category', targetId: category.id }, approvedCatalog),
      { categoryId: category.id },
    )
  }

  for (const group of catalogGroups) {
    const resolved = resolveChatEntry(
      { targetType: 'group', targetId: group.id },
      approvedCatalog,
    )
    assert.ok(resolved, `group ${group.id} must resolve`)
    assert.equal(resolved.categoryId, group.categoryId)
    assert.equal(resolved.groupId, group.id)
    assert.equal(resolved.serviceId, group.directServiceId)
  }

  for (const service of catalogServices) {
    const resolved = resolveChatEntry(
      { targetType: 'service', targetId: service.id },
      approvedCatalog,
    )
    assert.ok(resolved, `service ${service.id} must resolve`)
    assert.equal(resolved.categoryId, service.categoryId)
    assert.equal(resolved.groupId, service.groupId)
    assert.equal(resolved.serviceId, service.id)
  }
})
