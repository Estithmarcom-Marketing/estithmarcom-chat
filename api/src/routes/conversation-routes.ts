import type {
  FastifyInstance,
} from 'fastify'

import {
  createCustomerMessage,
  loadConversation,
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
}