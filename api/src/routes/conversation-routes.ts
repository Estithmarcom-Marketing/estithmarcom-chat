import type {
  FastifyInstance,
} from 'fastify'

import {
  loadConversation,
} from '../services/conversation-service.js'

interface ConversationParams {
  conversationId: string
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
}