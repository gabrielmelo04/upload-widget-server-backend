import { uploadImage } from '@/app/functions/upload-image'
import { isRight, unwrapEither } from '@/shared/either'
import type { FastifyInstance } from 'fastify'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod' // Para entender que temos o zod para fazer as validações
import { z } from 'zod'

export const uploadImageRoute: FastifyPluginAsyncZod = async (
  server: FastifyInstance
) => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        tags: ['uploads'],
        consumes: ['multipart/form-data'],
        response: {
          201: z.object({
            uploadId: z.null().describe('Image upload'),
          }),
          400: z.object({
            message: z.string(),
          }),
          409: z
            .object({
              message: z.string(),
            })
            .describe('Upload already exists.'),
        },
      },
    },
    async (request, reply) => {
      const uploadFile = await request.file({
        limits: {
          fileSize: 1024 * 1024 * 2, // 2mb
        },
      })

      if (!uploadFile) {
        return reply.status(400).send({ message: 'File is required.' })
      }

      const result = await uploadImage({
        fileName: uploadFile.filename,
        contentType: uploadFile.mimetype,
        contentStream: uploadFile.file,
      })

      //Bateu no limite
      if (uploadFile.file.truncated) {
        return reply.status(400).send({ message: 'File size limit reached.' })
      }

      //Se for sucesso
      if (isRight(result)) {
        console.log(unwrapEither(result)) //pegar o conteudo

        return reply.status(201).send()
      }

      //Vai devolver o erro
      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'InvalidFileFormat':
          return reply.status(400).send({ message: error.message })
      }
    }
  )
}
