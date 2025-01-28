import { env } from '@/env'
import type { Config } from 'drizzle-kit'

export default {
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: 'postgresql',
  schema: 'src/infra/db/schemas/*',
  out: 'src/infra/db/migrations', //Migration ( controle de versão do nossso banco de dados, são git )
} satisfies Config
