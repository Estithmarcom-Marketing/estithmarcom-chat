import type {
  FastifyInstance,
} from 'fastify'

import {
  createSession,
} from '../services/session-service.js'

interface StartSessionBody {
  locale?: 'ar' | 'en'
}

const startSessionBodySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    locale: {
      type: 'string',
      enum: [
        'ar',
        'en',
      ],
    },
  },
} as const

export async function sessionRoutes(
  app: FastifyInstance,
) {
  app.post<{
    Body: StartSessionBody
  }>(
    '/v1/sessions',
    {
      schema: {
        body: startSessionBodySchema,
      },
    },
    async (request, reply) => {
      const session =
        await createSession(
          request.body?.locale ?? 'ar',
        )

      return reply
        .code(201)
        .send(session)
    },
  )
}