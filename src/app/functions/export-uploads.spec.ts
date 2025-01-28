import { randomUUID } from 'node:crypto'
import * as upload from '@/infra/storage/upload-file-to-storage'
import { isRight, unwrapEither } from '@/shared/either'
import { makeupload } from '@/test/factories/make-uploads'
import { describe, expect, it, vi } from 'vitest'
import { exportUploads } from './export-uploads'

describe('export uploads', () => {
  it('should be able to export uploads', async () => {
    const uploadStub = vi
      .spyOn(upload, 'uploadFileToStorage')
      .mockImplementationOnce(async () => {
        return {
          key: `${randomUUID()}.csv`,
          url: 'https://storage.com/file.csv',
        }
      })

    // spy -> monitorar que algo foi alterado
    // stub -> alterar o comportamento de algo

    const namePattern = randomUUID()

    const upload1 = await makeupload({ name: `${namePattern}.webp` })
    const upload2 = await makeupload({ name: `${namePattern}.webp` })
    const upload3 = await makeupload({ name: `${namePattern}.webp` })
    const upload4 = await makeupload({ name: `${namePattern}.webp` })
    const upload5 = await makeupload({ name: `${namePattern}.webp` })

    const sut = await exportUploads({
      searchQuery: namePattern,
    })

    const generateCSVStream = uploadStub.mock.calls[0][0].contentStream

    const csvAsString = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = []

      generateCSVStream.on('data', (chunk: Buffer) => {
        // console.log(chunk)
        chunks.push(chunk)
      })

      generateCSVStream.on('end', () => {
        resolve(Buffer.concat(chunks).toString('utf-8'))
      })

      generateCSVStream.on('error', err => {
        reject(err)
      })
    })

    const csvAsArray = csvAsString
      .trim()
      .split('\n')
      .map(row => row.split(','))

    console.log(csvAsArray)

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      reportUrl: 'https://storage.com/file.csv',
    })
    expect(csvAsArray).toEqual([
      ['ID', 'Name', 'Url', 'Uploaded at'],
      [upload1.id, upload1.name, upload1.remoteUrl, expect.any(String)],
      [upload2.id, upload2.name, upload2.remoteUrl, expect.any(String)],
      [upload3.id, upload3.name, upload3.remoteUrl, expect.any(String)],
      [upload4.id, upload4.name, upload4.remoteUrl, expect.any(String)],
      [upload5.id, upload5.name, upload5.remoteUrl, expect.any(String)],
    ])
  })
})
