// @ts-nocheck

import { Pack, PackManager } from '@/managers/PackManager'
import { supabase } from '@/lib/supabase'

const mockedSupabasePacks = [
  {
    id: 'pack1',
    name: 'Pack 1',
    description: 'This is a pack',
    image: 'pack1.png',
    cards: [{ id: '1' }, { id: '2' }],
  },
  {
    id: 'pack3',
    name: 'Pack 3',
    description: 'This is a third pack',
    image: 'pack3.png',
    cards: [{ id: '3' }, { id: '4' }],
  },
  {
    id: 'pack2',
    name: 'Pack 2',
    description: 'This is another pack',
    image: 'pack2.png',
    cards: [{ id: '2' }, { id: '3' }],
  },
]

const mockedPacks: Pack[] = [
  {
    id: 'pack1',
    name: 'Pack 1',
    description: 'This is a pack',
    image: 'pack1.png',
    cards: new Set(['1', '2']),
  },
  {
    id: 'pack3',
    name: 'Pack 3',
    description: 'This is a third pack',
    image: 'pack3.png',
    cards: new Set(['3', '4']),
  },
  {
    id: 'pack2',
    name: 'Pack 2',
    description: 'This is another pack',
    image: 'pack2.png',
    cards: new Set(['2', '3']),
  },
]

const mockedSortedPacks = [...mockedPacks].sort((a, b) => a.name.localeCompare(b.name))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: (columnName: keyof Pack, value: string) => ({
          single: () => ({
            throwOnError: () => ({ data: mockedSupabasePacks.find(pack => pack[columnName] === value) }),
          }),
        }),
        order: (columnName: 'id' | 'name') => ({
          throwOnError: () => ({
            data: [...mockedSupabasePacks].sort((a, b) => a[columnName].localeCompare(b[columnName])),
          }),
        }),
      }),
    }),
    storage: {
      from: () => ({
        download: (imageName: string) => ({
          data: imageName + '-blob',
          error: null,
        }),
      }),
    },
  },
}))

jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  blobToBase64: (blob: string) => blob + '-base64data',
}))

beforeEach(() => {
  // @ts-ignore
  PackManager._items = null
})

describe('items', () => {
  it('should return all packs sorted by name', () => {
    PackManager.set(mockedPacks)
    expect(PackManager.items).toEqual(mockedSortedPacks)
  })

  it('should return undefined if _items is null', () => {
    // @ts-ignore
    expect(PackManager.items).toBeUndefined()
  })
})

describe('fetchAll', () => {
  it('should return all packs', async () => {
    const packs = await PackManager.fetchAll()
    expect(packs).toEqual(mockedSortedPacks)
  })

  it('should throw a NotFoundError if no packs are found', async () => {
    jest.spyOn(supabase, 'from').mockReturnValueOnce({
      select: () => ({
        order: () => ({
          // @ts-ignore
          throwOnError: () => ({ data: [] }),
        }),
      }),
    })
    await expect(PackManager.fetchAll()).rejects.toThrow(`No data found in table 'packs'`)
  })

  it('should throw if an error occurs', async () => {
    jest.spyOn(supabase, 'from').mockReturnValueOnce({
      select: () => ({
        order: () => ({
          // @ts-ignore
          throwOnError: () => ({ error: new Error() }),
        }),
      }),
    })
    await expect(PackManager.fetchAll()).rejects.toThrow()
  })
})

describe('getImageQuery', () => {
  it('should return a query object with the correct queryKey and queryFn', () => {
    const imageName = 'pack1.png'
    // @ts-ignore
    const fetchImageSpy = jest.spyOn(PackManager, 'fetchImage')
    const query = PackManager.getImageQuery(imageName)
    expect(query.queryKey).toEqual(['storage', 'packs', imageName])
    expect(query.queryFn).toBeDefined()
    expect(query.enabled).toBe(true)
    // Call the queryFn
    query.queryFn()
    // Assert that PackManager.fetchImage has been called
    expect(fetchImageSpy).toHaveBeenCalledWith(imageName)
  })

  it('should return a query object with enabled set to false if imageName is null', () => {
    const imageName = null
    const query = PackManager.getImageQuery(imageName)
    expect(query.queryKey).toEqual([])
    expect(query.queryFn).toBeDefined()
    expect(query.enabled).toBe(false)
    expect(query.queryFn()).resolves.toBeNull()
  })
})

describe('fetchImage', () => {
  const imageName = 'pack1.png'

  it('should return the base64 image data', async () => {
    // @ts-ignore
    const imageData = await PackManager.fetchImage(imageName)
    expect(imageData).toBe('pack1.png-blob-base64data')
  })

  it('should throw if an error occurs', async () => {
    jest.spyOn(supabase.storage, 'from').mockReturnValueOnce({
      // @ts-ignore
      download: () => ({
        data: null,
        error: new Error(),
      }),
    })
    // @ts-ignore
    await expect(PackManager.fetchImage(imageName)).rejects.toThrow()
  })
})
