import Fastify from 'fastify'

import {
  conversationRoutes,
} from './routes/conversation-routes.js'

import {
  sessionRoutes,
} from './routes/session-routes.js'

export function buildApp() {
  const app = Fastify({
    logger: true,
  })

  app.get('/health', async () => {
    return {
      status: 'ok',
      service:
        'estithmarcom-chat-api',
    }
  })

  app.register(sessionRoutes)
  app.register(conversationRoutes)

  return app
}