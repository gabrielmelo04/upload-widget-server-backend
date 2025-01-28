import { env } from '@/env'
import { fastifyCors } from '@fastify/cors'
import { fastifyMultipart } from '@fastify/multipart'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  // jsonSchemaTransform, //Para identificar os erros de validação
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { exportUploadsRoute } from './routes/export-uploads'
import { getUploadRoute } from './routes/get-uploads'
import { transformSwaggerSchema } from './routes/transform-swagger-schema'
import { uploadImageRoute } from './routes/upload-image'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.validation })
  }
  // Envia o erro para alguma ferramenta de observabilidade (Ex: Sentry, Datadog, Grafana, OTel, etc.)

  console.log(error)

  return reply.status(500).send({ message: 'Internal server error' })
}) // Todos os erros que eu não lidar na rota

server.register(fastifyCors, {
  origin: '*',
})

server.register(fastifyMultipart)
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Upload Server',
      version: '1.0.0',
    },
  },
  transform: transformSwaggerSchema, //converte a estrutura para o swagger
})

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

server.register(uploadImageRoute)
server.register(getUploadRoute)
server.register(exportUploadsRoute)

console.log(env.DATABASE_URL)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server running!')
})
