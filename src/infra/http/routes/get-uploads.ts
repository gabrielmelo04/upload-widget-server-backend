import { getUploads } from '@/app/functions/get-upload'
import { unwrapEither } from '@/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod' // Para entender que temos o zod para fazer as validações
import { z } from 'zod'

export const getUploadRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/uploads',
    {
      schema: {
        summary: 'Get uploads',
        tags: ['uploads'],
        querystring: z.object({
          searchQuery: z.string().optional(),
          sortBy: z.enum(['createdAt']).optional(), // Ordenar por data de criacao
          sortDirection: z.enum(['asc', 'desc']).optional(),
          page: z.coerce.number().optional().default(1),
          pageSize: z.coerce.number().optional().default(20), //coerce -> converter para number
        }),
        response: {
          200: z.object({
            uploads: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                remoteKey: z.string(),
                remoteUrl: z.string(),
                createdAt: z.date(),
              })
            ),
            total: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { page, pageSize, searchQuery, sortBy, sortDirection } =
        request.query

      const result = await getUploads({
        searchQuery,
        sortBy,
        sortDirection,
        page,
        pageSize,
      })

      const { uploads, total } = unwrapEither(result)

      return reply.status(201).send({ uploads, total })
    }
  )
}
