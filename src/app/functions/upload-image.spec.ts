import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isLeft, isRight, unwrapEither } from '@/shared/either'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InvalidFileFormat } from './erros/invalid-file-format'
import { uploadImage } from './upload-image'

describe('upload image', () => {
  beforeEach(() => {
    vi.mock('@/infra/storage/upload-file-to-storage', () => {
      //mock quando vamos subir um arquivo para o storage
      return {
        uploadFileToStorage: vi.fn().mockImplementation(() => {
          return {
            key: `${randomUUID()}.jpg`,
            url: 'https://storage.com/image.jpg',
          }
        }),
      }
    })
  })

  it('should be able to upload an image', async () => {
    const fileName = `${randomUUID()}-file.jpg`

    //System under test -> qual variável estamos testando
    const sut = await uploadImage({
      fileName,
      contentType: 'image/jpeg',
      contentStream: Readable.from([]),
    })

    expect(isRight(sut)).toBe(true)

    //verificar se a imagem foi criada no banco de dados
    const result = await db
      .select()
      .from(schema.uploads)
      .where(eq(schema.uploads.name, fileName))

    expect(result).toHaveLength(1)
  })

  it('should not be able to upload an invalid file', async () => {
    const fileName = `${randomUUID()}-file.pdf`

    //System under test -> qual variável estamos testando
    const sut = await uploadImage({
      fileName,
      contentType: 'image/pdf',
      contentStream: Readable.from([]),
    })

    expect(isLeft(sut)).toBe(true)

    expect(unwrapEither(sut)).toBeInstanceOf(InvalidFileFormat)
  })
})
