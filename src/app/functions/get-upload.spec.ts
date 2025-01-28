import { randomUUID } from 'node:crypto'
import { isRight, unwrapEither } from '@/shared/either'
import { makeupload } from '@/test/factories/make-uploads'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { describe, expect, it } from 'vitest'
import { getUploads } from './get-upload'

dayjs.extend(utc)
dayjs.extend(timezone)

describe('get uploads', () => {
  it('should be able to get the uploads', async () => {
    //System under test -> qual variável estamos testando

    const namePattern = randomUUID()

    const upload1 = await makeupload({ name: `${namePattern}.webp` })
    const upload2 = await makeupload({ name: `${namePattern}.webp` })
    const upload3 = await makeupload({ name: `${namePattern}.webp` })
    const upload4 = await makeupload({ name: `${namePattern}.webp` })
    const upload5 = await makeupload({ name: `${namePattern}.webp` })

    const sut = await getUploads({
      searchQuery: namePattern,
      page: 1,
      pageSize: 20,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toEqual(5)
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ])
  })

  it('should be able to get paginated uploads', async () => {
    //System under test -> qual variável estamos testando

    const namePattern = randomUUID()

    const upload1 = await makeupload({ name: `${namePattern}.webp` })
    const upload2 = await makeupload({ name: `${namePattern}.webp` })
    const upload3 = await makeupload({ name: `${namePattern}.webp` })
    const upload4 = await makeupload({ name: `${namePattern}.webp` })
    const upload5 = await makeupload({ name: `${namePattern}.webp` })

    let sut = await getUploads({
      searchQuery: namePattern,
      page: 1,
      pageSize: 3,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toEqual(5)
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
    ])

    sut = await getUploads({
      searchQuery: namePattern,
      page: 2,
      pageSize: 3,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toEqual(5)
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ])
  })

  it('should be able to get sorted uploads', async () => {
    //System under test -> qual variável estamos testando

    const namePattern = randomUUID()

    const upload1 = await makeupload({
      name: `${namePattern}.webp`,
      createdAt: new Date(),
    })

    const upload2 = await makeupload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().tz('America/Sao_Paulo').subtract(1, 'days').toDate(),
    })

    const upload3 = await makeupload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().tz('America/Sao_Paulo').subtract(2, 'days').toDate(),
    })

    const upload4 = await makeupload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().tz('America/Sao_Paulo').subtract(3, 'days').toDate(),
    })

    const upload5 = await makeupload({
      name: `${namePattern}.webp`,
      createdAt: dayjs().tz('America/Sao_Paulo').subtract(4, 'days').toDate(),
    })

    let sut = await getUploads({
      searchQuery: namePattern,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      page: 1,
      pageSize: 20,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toEqual(5)
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload1.id }),
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload3.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload5.id }),
    ])

    sut = await getUploads({
      searchQuery: namePattern,
      sortBy: 'createdAt',
      sortDirection: 'asc',
      page: 1,
      pageSize: 20,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut).total).toEqual(5)
    expect(unwrapEither(sut).uploads).toEqual([
      expect.objectContaining({ id: upload5.id }),
      expect.objectContaining({ id: upload4.id }),
      expect.objectContaining({ id: upload3.id }),
      expect.objectContaining({ id: upload2.id }),
      expect.objectContaining({ id: upload1.id }),
    ])
  })
})
