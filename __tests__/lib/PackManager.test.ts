import { supabase } from '@/src/lib/supabase'
import { Configuration, ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Pack, PackManager } from '@/src/managers/PackManager'

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
    availability: { isAvailable: true },
  } as Pack,
  {
    id: 'pack3',
    name: 'Pack 3',
    description: 'This is a third pack',
    image: 'pack3.png',
    cards: ['3', '4'],
    availability: { isAvailable: true },
  } as Pack,
  {
    id: 'pack2',
    name: 'Pack 2',
    description: 'This is another pack',
    image: 'pack2.png',
    availability: { isAvailable: true },
    cards: ['2', '3'],
  } as Pack,
]

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

beforeAll(() => {
  ConfigurationManager['set']([{ id: 'pre_period_days', data_type: 'number', number: 14 } as Configuration])
})

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
  const testCases = [
    { minPlayableCards: 1, totalCardCount: 1, playableCardCount: 1, expected: true },
    { minPlayableCards: 2, totalCardCount: 2, playableCardCount: 1, expected: false },
    { minPlayableCards: 10, totalCardCount: 1, playableCardCount: 11, expected: true },
    { minPlayableCards: 2, totalCardCount: 1, playableCardCount: 1, expected: true },
    { minPlayableCards: 0, totalCardCount: 0, playableCardCount: 0, expected: false },
  ]

  testCases.forEach(({ minPlayableCards, totalCardCount, playableCardCount, expected }) => {
    it(`should return ${expected} if totalCardCount is ${totalCardCount}, playableCardCount is ${playableCardCount} and minPlayableCards is ${minPlayableCards}`, () => {
      jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(minPlayableCards)

      const isPlayable = PackManager['isPlayable'](totalCardCount, playableCardCount)

      expect(isPlayable).toBe(expected)
    })
  })
})

describe('getAvailability', () => {
  function toDateString(date: Date) {
    return (
      date.getFullYear().toString().padStart(4, '0') +
      '-' +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      date.getDate().toString().padStart(2, '0')
    )
  }

  it('should return available true when no dates are provided', () => {
    expect(PackManager.getAvailability({ start_date: null, end_date: null })).toEqual({ isAvailable: true })
  })

  describe('when only start date provided', () => {
    it('should return -1 day until start when start day is yesterday', () => {
      const today = new Date('2020-02-03')
      const start_date = '2020-02-02'

      const result = PackManager.getAvailability({ start_date, end_date: null }, today)

      expect(result.isAvailable).toBe(true)
      expect(result.start?.soon).toBe(false)
      expect(result.start?.daysUntil).toBe(-1)
    })

    it('should return 0 days until start when start day is today', () => {
      const today = new Date()
      const result = PackManager.getAvailability({ start_date: toDateString(today), end_date: null }, today)

      expect(result.isAvailable).toBe(true)
      expect(result.start?.soon).toBe(false)
      expect(result.start?.daysUntil).toBe(0)
    })

    it('should return 1 day until start when start day is tomorrow', () => {
      const today = new Date('1000-02-03')
      const start_date = '1000-02-04'

      const result = PackManager.getAvailability({ start_date, end_date: null }, today)

      expect(result.isAvailable).toBe(false)
      expect(result.start?.soon).toBe(true)
      expect(result.start?.daysUntil).toBe(1)
    })

    it('should not return soon start when start day is in a year', () => {
      const today = new Date('1997-01-31')
      const start_date = '1998-01-31'

      const result = PackManager.getAvailability({ start_date, end_date: null }, today)

      expect(result.isAvailable).toBe(false)
      expect(result.start?.soon).toBe(false)
      expect(result.start?.daysUntil).toBe(365)
    })
  })

  describe('when only end date provided', () => {
    it('should return -1 day until end when end day is yesterday', () => {
      const today = new Date('2020-02-03')
      const end_date = '2020-02-02'

      const result = PackManager.getAvailability({ start_date: null, end_date }, today)

      expect(result.isAvailable).toBe(false)
      expect(result.end?.soon).toBe(false)
      expect(result.end?.daysUntil).toBe(-1)
    })

    it('should return 0 days until end when end day is today', () => {
      const today = new Date()

      const result = PackManager.getAvailability({ start_date: null, end_date: toDateString(today) }, today)

      expect(result.isAvailable).toBe(true)
      expect(result.end?.soon).toBe(false)
      expect(result.end?.daysUntil === 0).toBeTruthy()
    })

    it('should return 1 day until end when end day is tomorrow', () => {
      const today = new Date('1000-02-03')
      const end_date = '1000-02-04'

      const result = PackManager.getAvailability({ start_date: null, end_date }, today)

      expect(result.isAvailable).toBe(true)
      expect(result.end?.soon).toBe(true)
      expect(result.end?.daysUntil).toBe(1)
    })

    it('should not return soon end when end day is in a year', () => {
      const today = new Date('1997-01-31')
      const end_date = '1998-01-31'

      const result = PackManager.getAvailability({ start_date: null, end_date }, today)

      expect(result.isAvailable).toBe(true)
      expect(result.end?.soon).toBe(false)
      expect(result.end?.daysUntil).toBe(365)
    })
  })

  describe('when both start and end dates provided', () => {
    it('when today is between start and end date no crossing year', () => {
      const today = new Date('2020-06-01')
      const start_date = '0004-05-01'
      const end_date = '0000-07-01'

      const result = PackManager.getAvailability({ start_date, end_date }, today)

      expect(result.isAvailable).toBe(true)
      expect(result.start?.soon).toBe(false)
      expect(result.start?.daysUntil).toBe(334)
      expect(result.end?.soon).toBe(false)
      expect(result.end?.daysUntil).toBe(30)
    })

    it('when start date is soon', () => {
      const today = new Date('2020-01-20')
      const start_date = '0004-01-21'
      const end_date = '0000-12-22'

      const result = PackManager.getAvailability({ start_date, end_date }, today)

      expect(result.isAvailable).toBe(false)
      expect(result.start?.soon).toBe(true)
      expect(result.start?.daysUntil).toBe(1)
      expect(result.end?.soon).toBe(false)
      expect(result.end?.daysUntil).toBe(337)
    })

    it('when today is between start and end date with crossing year', () => {
      const today = new Date('2020-01-01')
      const start_date = '0004-12-01'
      const end_date = '0000-02-01'

      const result = PackManager.getAvailability({ start_date, end_date }, today)

      expect(result.isAvailable).toBe(true)
      expect(result.start?.soon).toBe(false)
      expect(result.start?.daysUntil).toBe(335)
      expect(result.end?.soon).toBe(false)
      expect(result.end?.daysUntil).toBe(31)
    })

    it('when end date is soon', () => {
      const today = new Date('2025-03-22T20:26:00.000+01:00')
      const start_date = toDateString(new Date(today.getTime() - 1000 * 60 * 60 * 24 * 10))
      const end_date = toDateString(new Date(today.getTime() + 1000 * 60 * 60 * 24))

      const result = PackManager.getAvailability({ start_date, end_date }, today)

      expect(result.isAvailable).toBe(true)
      expect(result.start?.soon).toBe(false)
      expect(result.start?.daysUntil).toBe(355)
      expect(result.end?.soon).toBe(true)
      expect(result.end?.daysUntil).toBe(1)
    })

    it('when today is not between start and end date with crossing year', () => {
      const today = new Date('2020-03-01')
      const start_date = '0004-12-01'
      const end_date = '0000-02-01'

      const result = PackManager.getAvailability({ start_date, end_date }, today)

      expect(result.isAvailable).toBe(false)
      expect(result.start?.soon).toBe(false)
      expect(result.start?.daysUntil).toBe(275)
      expect(result.end?.soon).toBe(false)
      expect(result.end?.daysUntil).toBe(337)
    })

    it('when today is on start_date and end_date', () => {
      const today = new Date('2020-01-01')

      const result = PackManager.getAvailability(
        { start_date: toDateString(today), end_date: toDateString(today) },
        today
      )

      expect(result.isAvailable).toBe(true)
      expect(result.start?.soon).toBe(false)
      expect(result.start?.daysUntil === 0).toBeTruthy()
      expect(result.end?.soon).toBe(true)
      expect(result.end?.daysUntil === 0).toBeTruthy()
    })

    it('when today is on start_date', () => {
      const today = new Date('2020-01-01')

      const result = PackManager.getAvailability({ start_date: toDateString(today), end_date: '2020-02-01' }, today)

      expect(result.isAvailable).toBe(true)
      expect(result.start?.soon).toBe(false)
      expect(result.start?.daysUntil).toBe(0)
      expect(result.end?.soon).toBe(false)
      expect(result.end?.daysUntil).toBe(31)
    })
  })
})

describe('daysUntil', () => {
  it('should return 0 if the date is today', () => {
    const today = new Date('2020-06-23')
    expect(PackManager['daysUntil'](today, today)).toBe(0)
  })

  it('should return 1 if the date is tomorrow', () => {
    const today = new Date('2020-06-23')
    const date = new Date('2020-06-24')
    expect(PackManager['daysUntil'](date, today)).toBe(1)
  })

  it('should return 364 if the date is yesterday', () => {
    const today = new Date('2020-06-23')
    const date = new Date('2020-06-22')
    expect(PackManager['daysUntil'](date, today)).toBe(-1)
  })
})

describe('daysUntilYearless', () => {
  const invalidDates = [
    '123', // too short
    '12345', // no hyphen
    '1-2', // missing leading zeros
  ]

  invalidDates.forEach(date => {
    it(`should throw error for invalid date format: '${date}'`, () => {
      expect(() => PackManager['daysUntilYearless'](date)).toThrow()
    })
  })

  it('should accept valid date format', () => {
    const validDates = ['01-01', '12-31', '06-15', '02-29', '09-30']

    validDates.forEach(date => {
      expect(() => PackManager['daysUntilYearless'](date)).not.toThrow()
    })
  })
})

describe('validatePlayability', () => {
  beforeEach(() => {
    // Mock isPlayable to control its behavior in tests
    jest.spyOn(PackManager as any, 'isPlayable').mockImplementation(() => true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const createPack = (overrides = {}): Pack => ({
    id: 'test-pack',
    name: 'Test Pack',
    description: 'Test pack description',
    image: 'test.png',
    cards: ['1', '2', '3'],
    is_free: true,
    availability: { isAvailable: true },
    created_at: '2024-01-01',
    modified_at: '2024-01-01',
    start_date: null,
    end_date: null,
    language: 'en',
    ...overrides,
  })

  it('should return empty set when pack is fully playable', () => {
    const pack = createPack()
    ;(PackManager as any)['isPlayable'].mockImplementation(() => true)

    const reasons = PackManager.validatePlayability(true, pack, 3)

    expect(reasons.size).toBe(0)
  })

  it('should return cardCount when not enough playable cards', () => {
    const pack = createPack()
    ;(PackManager as any)['isPlayable'].mockImplementation(() => false)

    const reasons = PackManager.validatePlayability(true, pack, 1)

    expect(reasons.size).toBe(1)
    expect(reasons.has('cardCount')).toBe(true)
  })

  it('should return dateRestriction when pack is not available', () => {
    const pack = createPack({ availability: { isAvailable: false } })
    ;(PackManager as any)['isPlayable'].mockImplementation(() => true)

    const reasons = PackManager.validatePlayability(true, pack, 3)

    expect(reasons.size).toBe(1)
    expect(reasons.has('dateRestriction')).toBe(true)
  })

  it('should return subscription when pack is not free and user is not subscribed', () => {
    const pack = createPack({ is_free: false })
    ;(PackManager as any)['isPlayable'].mockImplementation(() => true)

    const reasons = PackManager.validatePlayability(false, pack, 3)

    expect(reasons.size).toBe(1)
    expect(reasons.has('subscription')).toBe(true)
  })

  it('should return multiple reasons when multiple conditions are not met', () => {
    const pack = createPack({
      is_free: false,
      availability: { isAvailable: false },
    })
    ;(PackManager as any)['isPlayable'].mockImplementation(() => false)

    const reasons = PackManager.validatePlayability(false, pack, 1)

    expect(reasons.size).toBe(3)
    expect(reasons.has('cardCount')).toBe(true)
    expect(reasons.has('dateRestriction')).toBe(true)
    expect(reasons.has('subscription')).toBe(true)
  })

  it('should not return subscription reason for free pack when user is not subscribed', () => {
    const pack = createPack({ is_free: true })
    ;(PackManager as any)['isPlayable'].mockImplementation(() => true)

    const reasons = PackManager.validatePlayability(false, pack, 3)

    expect(reasons.size).toBe(0)
  })

  it('should not return subscription reason for paid pack when user is subscribed', () => {
    const pack = createPack({ is_free: false })
    ;(PackManager as any)['isPlayable'].mockImplementation(() => true)

    const reasons = PackManager.validatePlayability(true, pack, 3)

    expect(reasons.size).toBe(0)
  })
})
