import { Pack, PackManager } from '@/src/managers/PackManager'
import { supabase } from '@/src/lib/supabase'
import { ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Card, CardManager } from '@/src/managers/CardManager'
import { Player } from '@/src/models/Player'

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

const mockedPacks = [
  {
    id: 'pack1',
    name: 'Pack 1',
    description: 'This is a pack',
    image: 'pack1.png',
    cards: ['1', '2'],
  },
  {
    id: 'pack3',
    name: 'Pack 3',
    description: 'This is a third pack',
    image: 'pack3.png',
    cards: ['3', '4'],
  },
  {
    id: 'pack2',
    name: 'Pack 2',
    description: 'This is another pack',
    image: 'pack2.png',
    cards: ['2', '3'],
  },
] as Pack[]

const mockedSortedPacks = [...mockedPacks].sort((a, b) => a.name.localeCompare(b.name))

const order = (columnName: 'id' | 'name') => ({
  throwOnError: () => ({
    data: [...mockedSupabasePacks].sort((a, b) => a[columnName].localeCompare(b[columnName])),
  }),
})

const eq = (columnName: keyof Pack, value: string) => ({
  single: () => ({
    // @ts-ignore
    throwOnError: () => ({ data: mockedSupabasePacks.find(pack => pack[columnName] === value) }),
  }),
  order,
})

const supabaseObj = {
  from: () => ({
    select: () => ({
      eq,
      order,
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
}

jest.mock('@/src/lib/supabase', () => ({
  supabase: supabaseObj,
}))

jest.mock('@/src/lib/utils', () => ({
  ...jest.requireActual('@/src/lib/utils'),
  blobToBase64: (blob: string) => blob + '-base64data',
}))

jest.mock('@/src/managers/LanguageManager', () => ({
  LanguageManager: {
    getLanguage: () => ({ id: 'en' }),
  },
}))

afterEach(() => {
  PackManager['_items'] = undefined
})

describe('items', () => {
  it('should return all packs sorted by name', () => {
    PackManager['set'](mockedPacks)
    expect(PackManager.items).toEqual(mockedSortedPacks)
  })

  it('should return undefined if _items is null', () => {
    expect(PackManager.items).toBeUndefined()
  })
})

describe('fetchAll', () => {
  it('should return all packs', async () => {
    const packs = await PackManager.fetchAll()
    expect(packs).toEqual(mockedSortedPacks)
  })

  it('should throw a NotFoundError if no packs are found', async () => {
    const returnEmpty = () => ({
      throwOnError: () => ({ error: new Error() }),
    })
    jest.spyOn(supabase, 'from').mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          // @ts-ignore
          order: returnEmpty,
        }),
      }),
    })

    const act = async () => await PackManager.fetchAll()
    await expect(act).rejects.toThrow(`No data found in table 'packs'`)
  })

  it('should throw if an error occurs', async () => {
    const returnError = () => ({
      throwOnError: () => ({ error: new Error() }),
    })
    jest.spyOn(supabase, 'from').mockReturnValueOnce({
      select: () => ({
        // @ts-ignore
        order: returnError,
      }),
    })

    const act = async () => await PackManager.fetchAll()
    expect(act).rejects.toThrow()
  })
})

describe('fetchImage', () => {
  const imageName = 'pack1.png'

  it('should return the base64 image data', async () => {
    const imageData = await PackManager['fetchImage'](imageName)
    expect(imageData).toBe('pack1.png-blob-base64data')
  })

  it('should throw if an error occurs', async () => {
    jest.spyOn(supabase.storage, 'from').mockReturnValueOnce({
      // @ts-ignore
      download: async () => ({
        data: null,
        error: new Error(),
      }),
    })

    await expect(PackManager['fetchImage'](imageName)).rejects.toThrow()
  })
})

describe('getPackOf', () => {
  it('should return a pack that exists in the playlist and contains the specified card', () => {
    const pack = PackManager.getPackOf('3', new Set(mockedPacks))
    expect(pack?.id).toBe('pack3')
  })

  it('should return null if no packs in the playlist contains the card', () => {
    const pack = PackManager.getPackOf('10', new Set(mockedPacks))
    expect(pack).toBeNull()
  })
})

describe('getPacskOf', () => {
  beforeEach(() => {
    PackManager['set'](mockedPacks)
  })

  it('should return all packs that contains the specified card', () => {
    const packs = PackManager.getPacksOf('2')
    expect(packs).toContain(mockedPacks[0])
    expect(packs).toContain(mockedPacks[2])
    expect(packs).toHaveLength(2)
  })

  it('should return an empty list if card is not found', () => {
    const packs = PackManager.getPacksOf('10')
    expect(packs).toHaveLength(0)
  })
})

describe('isPlayable', () => {
  it('should return true if the pack has enough available cards', () => {
    const players = new Set([{ name: '1' }, { name: '2' }]) as Set<Player>
    const categoryFilter = ['cat1']

    jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(1)
    const spyOnRequiredPlayCount = jest
      .spyOn(CardManager, 'getRequiredPlayerCount')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(10)
    const spyOnGetCard = jest.spyOn(CardManager, 'get').mockReturnValue({ category: 'cat2' } as Card)

    const isPlayable = PackManager.isPlayable(mockedPacks[0], players, categoryFilter)

    expect(spyOnGetCard).toHaveBeenCalledTimes(2)
    expect(spyOnRequiredPlayCount).toHaveBeenCalledTimes(2)
    expect(isPlayable).toBeTruthy()
  })

  it('should return false if there arent enough players', () => {
    const players = new Set([{ name: '1' }, { name: '2' }]) as Set<Player>
    const categoryFilter = ['cat1']

    jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(1)
    jest.spyOn(CardManager, 'getRequiredPlayerCount').mockReturnValue(10)
    jest.spyOn(CardManager, 'get').mockReturnValue({ category: 'cat2' } as Card)

    const isPlayable = PackManager.isPlayable(mockedPacks[0], players, categoryFilter)

    expect(isPlayable).toBeFalsy()
  })

  it('should return false if categories are filtered out', () => {
    const players = new Set([{ name: '1' }, { name: '2' }]) as Set<Player>
    const categoryFilter = ['cat1']

    jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(1)
    jest.spyOn(CardManager, 'getRequiredPlayerCount').mockReturnValue(0)
    jest.spyOn(CardManager, 'get').mockReturnValue({ category: 'cat1' } as Card)

    const isPlayable = PackManager.isPlayable(mockedPacks[0], players, categoryFilter)

    expect(isPlayable).toBeFalsy()
  })

  it('should return true if original amount of cards are less than limit', () => {
    const players = new Set([{ name: '1' }, { name: '2' }]) as Set<Player>
    const categoryFilter = ['cat2']

    jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(10)
    jest.spyOn(CardManager, 'getRequiredPlayerCount').mockReturnValue(0)
    jest.spyOn(CardManager, 'get').mockReturnValue({ category: 'cat1' } as Card)

    const isPlayable = PackManager.isPlayable(mockedPacks[0], players, categoryFilter)

    expect(isPlayable).toBeTruthy()
  })
})
