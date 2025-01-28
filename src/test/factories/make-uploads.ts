import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { fakerPT_BR as faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'

export async function makeupload(
  overrides?: Partial<InferInsertModel<typeof schema.uploads>> // O usuário pode enviar qualquer campo
) {
  const fileName = faker.system.fileName()

  const result = await db
    .insert(schema.uploads)
    .values({
      name: fileName,
      remoteKey: `images/${fileName}`,
      remoteUrl: `http://example.com/images/${fileName}`,
      ...overrides,
    })
    .returning()

  return result[0]
}
