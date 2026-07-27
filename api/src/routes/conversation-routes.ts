import type {
  FastifyInstance,
} from 'fastify'

import {
  createCustomerMessage,
  loadConversation,
  requestConversationHandoff,
  updateConversationContact,
  updateConversationPreferredContactTime,
  updateConversationService,
} from '../services/conversation-service.js'

interface ConversationParams {
  conversationId: string
}

interface SendMessageBody {
  content: string
}

interface UpdateServiceBody {
  categoryId: string
  categoryName: string
  platformId: string
  platformName: string
  serviceId: string
  serviceName: string
}

interface UpdateContactBody {
  name?: string
  phone?: string
  email?: string
}

interface RequestHandoffBody {
  handoffReason?: string
  originalQuestion?: string
  intent?: string
}

interface PreferredContactTimeBody {
  preferredContactTime: string
}

const conversationParamsSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'conversationId',
  ],
  properties: {
    conversationId: {
      type: 'string',
      format: 'uuid',
    },
  },
} as const

const sendMessageBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'content',
  ],
  properties: {
    content: {
      type: 'string',
      minLength: 1,
      maxLength: 5000,
    },
  },
} as const

const updateServiceBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'categoryId',
    'categoryName',
    'platformId',
    'platformName',
    'serviceId',
    'serviceName',
  ],
  properties: {
    categoryId: {
      type: 'string',
      minLength: 1,
      maxLength: 128,
    },

    categoryName: {
      type: 'string',
      minLength: 1,
      maxLength: 256,
    },

    platformId: {
      type: 'string',
      minLength: 1,
      maxLength: 128,
    },

    platformName: {
      type: 'string',
      minLength: 1,
      maxLength: 256,
    },

    serviceId: {
      type: 'string',
      minLength: 1,
      maxLength: 128,
    },

    serviceName: {
      type: 'string',
      minLength: 1,
      maxLength: 256,
    },
  },
} as const

const updateContactBodySchema = {
  type: 'object',
  additionalProperties: false,
  minProperties: 1,

  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 256,
    },

    phone: {
      type: 'string',
      minLength: 1,
      maxLength: 64,
    },

    email: {
      type: 'string',
      minLength: 1,
      maxLength: 320,
    },
  },
} as const

const requestHandoffBodySchema = {
  type: 'object',
  additionalProperties: false,

  properties: {
    handoffReason: {
      type: 'string',
      minLength: 1,
      maxLength: 1000,
    },

    originalQuestion: {
      type: 'string',
      minLength: 1,
      maxLength: 5000,
    },

    intent: {
      type: 'string',
      minLength: 1,
      maxLength: 128,
    },
  },
} as const

const preferredContactTimeBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'preferredContactTime',
  ],

  properties: {
    preferredContactTime: {
      type: 'string',
      minLength: 1,
      maxLength: 256,
    },
  },
} as const

export async function conversationRoutes(
  app: FastifyInstance,
) {
  app.get<{
    Params: ConversationParams
  }>(
    '/v1/conversations/:conversationId',
    {
      schema: {
        params:
          conversationParamsSchema,
      },
    },
    async (request, reply) => {
      const conversation =
        await loadConversation(
          request.params.conversationId,
        )

      if (!conversation) {
        return reply
          .code(404)
          .send({
            error:
              'conversation_not_found',
          })
      }

      return reply
        .code(200)
        .send(conversation)
    },
  )

  app.post<{
    Params: ConversationParams
    Body: SendMessageBody
  }>(
    '/v1/conversations/:conversationId/messages',
    {
      schema: {
        params:
          conversationParamsSchema,

        body:
          sendMessageBodySchema,
      },
    },
    async (request, reply) => {
      const trimmedContent =
        request.body.content.trim()

      if (!trimmedContent) {
        return reply
          .code(400)
          .send({
            error:
              'message_content_required',
          })
      }

      const message =
        await createCustomerMessage({
          publicSessionId:
            request.params.conversationId,

          content:
            trimmedContent,
        })

      if (!message) {
        return reply
          .code(404)
          .send({
            error:
              'conversation_not_found',
          })
      }

      return reply
        .code(201)
        .send(message)
    },
  )

  app.put<{
    Params: ConversationParams
    Body: UpdateServiceBody
  }>(
    '/v1/conversations/:conversationId/service',
    {
      schema: {
        params:
          conversationParamsSchema,

        body:
          updateServiceBodySchema,
      },
    },
    async (request, reply) => {
      const context =
        await updateConversationService({
          publicSessionId:
            request.params.conversationId,

          service: {
            categoryId:
              request.body.categoryId,

            categoryName:
              request.body.categoryName,

            platformId:
              request.body.platformId,

            platformName:
              request.body.platformName,

            serviceId:
              request.body.serviceId,

            serviceName:
              request.body.serviceName,
          },
        })

      if (!context) {
        return reply
          .code(404)
          .send({
            error:
              'conversation_not_found',
          })
      }

      return reply
        .code(200)
        .send(context)
    },
  )

  app.patch<{
    Params: ConversationParams
    Body: UpdateContactBody
  }>(
    '/v1/conversations/:conversationId/contact',
    {
      schema: {
        params:
          conversationParamsSchema,

        body:
          updateContactBodySchema,
      },
    },
    async (request, reply) => {
      const contact: UpdateContactBody = {}

      if (
        request.body.name !== undefined
      ) {
        const name =
          request.body.name.trim()

        if (!name) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_contact_name',
            })
        }

        contact.name = name
      }

      if (
        request.body.phone !== undefined
      ) {
        const phone =
          request.body.phone.trim()

        if (!phone) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_contact_phone',
            })
        }

        contact.phone = phone
      }

      if (
        request.body.email !== undefined
      ) {
        const email =
          request.body.email.trim()

        if (!email) {
          return reply
            .code(400)
            .send({
              error:
                'invalid_contact_email',
            })
        }

        contact.email = email
      }

      if (
        Object.keys(contact).length === 0
      ) {
        return reply
          .code(400)
          .send({
            error:
              'contact_field_required',
          })
      }

      const context =
        await updateConversationContact({
          publicSessionId:
            request.params.conversationId,

          contact,
        })

      if (!context) {
        return reply
          .code(404)
          .send({
            error:
              'conversation_not_found',
          })
      }

      return reply
        .code(200)
        .send(context)
    },
  )

  app.post<{
    Params: ConversationParams
    Body: RequestHandoffBody
  }>(
    '/v1/conversations/:conversationId/handoff',
    {
      schema: {
        params:
          conversationParamsSchema,

        body:
          requestHandoffBodySchema,
      },
    },
    async (request, reply) => {
      const context =
        await requestConversationHandoff({
          publicSessionId:
            request.params.conversationId,

          handoffReason:
            request.body.handoffReason?.trim(),

          originalQuestion:
            request.body.originalQuestion?.trim(),

          intent:
            request.body.intent?.trim(),
        })

      if (!context) {
        return reply
          .code(404)
          .send({
            error:
              'conversation_not_found',
          })
      }

      return reply
        .code(200)
        .send(context)
    },
  )

  app.put<{
    Params: ConversationParams
    Body: PreferredContactTimeBody
  }>(
    '/v1/conversations/:conversationId/preferred-contact-time',
    {
      schema: {
        params:
          conversationParamsSchema,

        body:
          preferredContactTimeBodySchema,
      },
    },
    async (request, reply) => {
      const preferredContactTime =
        request.body.preferredContactTime.trim()

      if (!preferredContactTime) {
        return reply
          .code(400)
          .send({
            error:
              'preferred_contact_time_required',
          })
      }

      const context =
        await updateConversationPreferredContactTime({
          publicSessionId:
            request.params.conversationId,

          preferredContactTime,
        })

      if (!context) {
        return reply
          .code(404)
          .send({
            error:
              'conversation_not_found',
          })
      }

      return reply
        .code(200)
        .send(context)
    },
  )
}