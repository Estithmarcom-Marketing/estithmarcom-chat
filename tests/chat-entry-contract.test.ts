import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CHAT_ENTRY_OPEN_MESSAGE,
  CHAT_ENTRY_STATE_MESSAGE,
  createChatEntryMessage,
  createChatEntryStateMessage,
  getChatEntryViewState,
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
    serviceCountryId: '1',
    serviceCountryName: 'السعودية',
    locale: 'ar',
  })

  assert.equal(message.type, CHAT_ENTRY_OPEN_MESSAGE)
  assert.deepEqual(parseChatEntryMessage(message), message.payload)
})

test('creates versioned view-state messages for iframe resizing', () => {
  assert.equal(getChatEntryViewState(false, false), 'closed')
  assert.equal(getChatEntryViewState(true, false), 'open')
  assert.equal(getChatEntryViewState(true, true), 'minimized')

  assert.deepEqual(createChatEntryStateMessage('open'), {
    type: CHAT_ENTRY_STATE_MESSAGE,
    version: 1,
    payload: { state: 'open' },
  })
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
    parseChatEntrySearch('?chat_target_type=group&chat_target_id=accounting&chat_source=service_details&website_service_id=20&service_country_id=4&service_country_name=%D8%B9%D9%85%D8%A7%D9%86&locale=ar'),
    {
      targetType: 'group',
      targetId: 'accounting',
      source: 'service_details',
      websiteServiceId: '20',
      serviceCountryId: '4',
      serviceCountryName: 'عمان',
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

test('excludes the retired government services branch and fails closed', () => {
  const approvedCatalog = {
    getCategoryById: (id: string) => catalogCategories.find((item) => item.id === id),
    getGroupById: (id: string) => catalogGroups.find((item) => item.id === id),
    getServiceById: (id: string) => catalogServices.find((item) => item.id === id),
  }

  assert.equal(
    catalogCategories.some((category) => category.id === 'government-services'),
    false,
  )
  assert.equal(
    catalogGroups.some((group) => group.categoryId === 'government-services'),
    false,
  )
  assert.equal(
    catalogServices.some((service) => service.categoryId === 'government-services'),
    false,
  )
  assert.equal(
    resolveChatEntry(
      { targetType: 'category', targetId: 'government-services' },
      approvedCatalog,
    ),
    null,
  )
  assert.equal(
    catalogCategories.some((category) => category.id === 'government-procedures'),
    true,
  )
})

test('keeps the approved catalog to two choices before specialist handoff', () => {
  const expectedCatalog = [
    {
      id: 'company-formation',
      title: 'تأسيس شركات',
      subtitle: 'تأسيس شركتك في السعودية والدول العربية والأجنبية: ابدأ شركتك بخطوات واضحة ومنظمة',
      groups: [
        'شركة تجارية',
        'شركة خدمية أو عقارية',
        'شركة صناعية',
        'شركة مساهمة',
        'أنواع أخرى',
      ],
    },
    {
      id: 'entrepreneurial-licenses',
      title: 'التراخيص الريادية واحتضان المشاريع',
      subtitle: 'احتضان الأفكار الريادية والمبتكرة وإصدار التراخيص',
      groups: [
        'تأسيس شركة ريادية',
        'احتضان مشروع ريادي',
      ],
    },
    {
      id: 'legal-services',
      title: 'الخدمات القانونية',
      subtitle: 'محامون موثوقون في القضايا التجارية وجميع الخدمات القانونية',
      groups: [
        'القضايا التجارية',
        'القضايا الإدارية',
        'القضايا العمالية',
        'التحكيم وتسوية المنازعات',
        'صياغة العقود والاتفاقيات',
        'قضايا أخرى',
      ],
    },
    {
      id: 'financial-services',
      title: 'الخدمات المالية',
      subtitle: 'مستشارون ماليون ومحاسبون قانونيون معتمدون في خدمة شركتك',
      groups: [
        'مستشار مالي',
        'محاسب قانوني',
        'مدخلو بيانات ومراجعو حسابات',
        'مالية أخرى',
      ],
    },
    {
      id: 'marketing-feasibility',
      title: 'خدمات التسويق ودراسة الجدوى',
      subtitle: 'خبراء يساعدونك في تقييم جدوى مشروعك وتسويقه وتطوير فرص نموه.',
      groups: [
        'دراسة جدوى',
        'التسويق وتطوير الأعمال',
      ],
    },
    {
      id: 'premium-residency',
      title: 'الإقامة المميزة والإقامة الذهبية',
      subtitle: 'إصدار الإقامة المميزة والذهبية والاستثمارية',
      groups: [
        'إقامة مميزة مستثمر أعمال',
        'إقامة مميزة مالك عقار',
        'إقامة مميزة رائد أعمال',
        'إقامة مميزة الموهبة',
        'إقامة مميزة الكفاءة الاستثنائية',
        'إقامة مميزة محددة المدة',
        'إقامة مميزة غير محددة المدة',
      ],
    },
    {
      id: 'government-procedures',
      title: 'الإجراءات الحكومية وإدارة المنصات',
      subtitle: 'إدارة المنصات الحكومية وإنجاز إجراءات الشركات والمؤسسات، بما فيها الزيارات اللازمة.',
      groups: [
        'إدارة جميع المنصات الحكومية للشركات والمؤسسات',
        'طلب زيارة من منشأة حكومية لإنهاء إجراء لشركة أو مؤسسة',
      ],
    },
    {
      id: 'ready-workspaces',
      title: 'استئجار مساحة عمل جاهزة',
      subtitle: 'مساحات عمل مجهزة ومرنة تناسب احتياجات الأفراد والشركات.',
      groups: [
        'مكتب مغلق',
        'مكتب مشترك',
      ],
    },
  ]

  const orderedCategories = [...catalogCategories]
    .sort((a, b) => a.displayOrder - b.displayOrder)

  assert.deepEqual(
    orderedCategories.map((category) => ({
      id: category.id,
      title: category.title,
      subtitle: category.subtitle,
    })),
    expectedCatalog.map(({ id, title, subtitle }) => ({
      id,
      title,
      subtitle,
    })),
  )

  assert.equal(catalogCategories.length, 8)
  assert.equal(catalogGroups.length, 30)

  const approvedCatalog = {
    getCategoryById: (id: string) =>
      catalogCategories.find((item) => item.id === id),
    getGroupById: (id: string) =>
      catalogGroups.find((item) => item.id === id),
    getServiceById: (id: string) =>
      catalogServices.find((item) => item.id === id),
  }

  for (const expectedCategory of expectedCatalog) {
    const groups = catalogGroups
      .filter((group) => group.categoryId === expectedCategory.id)
      .sort((a, b) => a.displayOrder - b.displayOrder)

    assert.deepEqual(
      groups.map((group) => group.title),
      expectedCategory.groups,
    )

    for (const group of groups) {
      assert.ok(
        group.directServiceId,
        `group ${group.id} must route directly`,
      )

      const directService = catalogServices.find(
        (service) => service.id === group.directServiceId,
      )

      assert.ok(
        directService,
        `direct service ${group.directServiceId} must exist`,
      )
      assert.equal(directService.categoryId, group.categoryId)
      assert.equal(directService.groupId, group.id)
      assert.equal(directService.title, group.title)

      const resolved = resolveChatEntry(
        {
          targetType: 'group',
          targetId: group.id,
        },
        approvedCatalog,
      )

      assert.ok(resolved)
      assert.equal(resolved.serviceId, group.directServiceId)
      assert.equal(resolved.selectedService?.serviceName, group.title)
    }
  }
})
