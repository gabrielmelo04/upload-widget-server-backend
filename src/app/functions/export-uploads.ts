import { PassThrough, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage'
import { type Either, makeRight } from '@/shared/either'
import { stringify } from 'csv-stringify'
import { ilike } from 'drizzle-orm'
import { z } from 'zod'

const exportUploadsInput = z.object({
  searchQuery: z.string().optional(),
})

type ExportUploadsInput = z.input<typeof exportUploadsInput>

type ExportUploadsOutput = {
  reportUrl: string
}

export async function exportUploads(
  input: ExportUploadsInput
): Promise<Either<never, ExportUploadsOutput>> {
  const { searchQuery } = exportUploadsInput.parse(input)

  const { sql, params } = db
    .select({
      id: schema.uploads.id,
      name: schema.uploads.name,
      remoteUrl: schema.uploads.remoteUrl,
      createdAt: schema.uploads.createdAt,
    })
    .from(schema.uploads)
    .where(
      searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined //caixa alta ou caixa baixa ilike
    )
    .toSQL()

  // Cursores
  const cursor = pg.unsafe(sql, params as string[]).cursor(2) //consumir os dados aos poucos (n dados por vez)

  //Para testar o cursor
  // for await (const rows of cursor) {
  //   console.log(rows)
  // }

  const csv = stringify({
    delimiter: ',', // seprarar as colunas por virgula
    header: true, // se a primeira linha vai ter os nomes das colunas
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'remote_url', header: 'Url' },
      { key: 'created_at', header: 'Uploaded at' },
    ],
  })

  const uploadToStorageStream = new PassThrough() // Uma implementação de stream de transform

  // READABLE / TRANSFORM / TRANSFORM / TRANSFORM  => WRITABLE
  const convertToCSVPipeline = pipeline(
    //vou ter uma entrada de dados, depois transformar o quanto eu quiser e depois uma saída
    cursor, //meu dados
    new Transform({
      objectMode: true, //transformar os dados sem ser um buffer
      transform(chunks: unknown[], encoding, callback) {
        for (const chunk of chunks) {
          this.push(chunk)
        }
        callback()
      },
    }),
    csv, //transformar os dados
    // new Transform({
    //   transform(chunk: Buffer, encoding, callback) {
    //     console.log(chunk.toString('utf-8'))
    //     callback()
    //   },
    // }),
    // stream de escrita do cloudflare R2
    uploadToStorageStream
  )

  const uploadToStorage = uploadFileToStorage({
    contentType: 'text/csv',
    folder: 'downloads',
    fileName: `${new Date().toISOString()}-uploads.csv`,
    contentStream: uploadToStorageStream,
  })

  const [{ url }] = await Promise.all([uploadToStorage, convertToCSVPipeline])

  return makeRight({ reportUrl: url })
}
