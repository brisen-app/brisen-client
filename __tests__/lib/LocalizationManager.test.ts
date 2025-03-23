import { supabase } from '@/src/lib/supabase'
import { Language, LanguageManager } from '@/src/managers/LanguageManager'
import { Localization, LocalizationKey, LocalizationManager } from '@/src/managers/LocalizationManager'
import { NotFoundError } from '@/src/models/Errors'

const mockedItems = [
  {
    id: '1',
    language: 'nb',
    value: 'Content of Localization 1',
  },
  {
    id: '3',
    language: 'en',
    value: 'Content of Localization 3',
  },
  {
    id: '2',
    language: 'nb',
    value: 'Content of Localization 2',
  },
] as Localization[]

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: (columnName1: keyof Localization, value1: string) => ({
          throwOnError: () => ({ data: mockedItems.filter(item => item[columnName1] === value1) }),
          eq: (columnName2: keyof Localization, value2: string) => ({
            single: () => ({
              throwOnError: () => ({
                data: mockedItems.find(item => item[columnName1] === value1 && item[columnName2] === value2),
              }),
            }),
          }),
        }),
      }),
    }),
  },
}))

jest.mock('@/src/managers/LanguageManager', () => ({
  LanguageManager: {
    getLanguage: () => ({ id: 'nb' }),
  },
}))

beforeEach(() => {
  LocalizationManager['_items'] = undefined
})

describe('fetch', () => {
  const testCases = [
    { id: '1', expected: mockedItems[0] },
    { id: '2', expected: mockedItems[2] },
  ]

  testCases.forEach(({ id, expected }) => {
    it(`should return all localizations for language '${id}'`, async () => {
      const Localization = await LocalizationManager.fetch(id)
      expect(Localization).toEqual(expected)
    })
  })

  it('should throw a NotFoundError if the Localization does not exist', async () => {
    const id = '0'
    await expect(LocalizationManager.fetch(id)).rejects.toThrow(NotFoundError)
  })

  it('should throw if an error occurs', async () => {
    const LocalizationID = '1'
    jest.spyOn(supabase, 'from').mockReturnValueOnce({
      select: () => ({
        throwOnError: () => ({ error: new Error() }),
      }),
    })
    await expect(LocalizationManager.fetch(LocalizationID)).rejects.toThrow()
  })
})

describe('fetchAll', () => {
  const testCases = [
    { lang: 'nb', expectedAmount: 2 },
    { lang: 'en', expectedAmount: 1 },
  ]

  testCases.forEach(language => {
    it(`should return all Localizations with language ${language.lang}`, async () => {
      jest.spyOn(LanguageManager, 'getLanguage').mockReturnValueOnce({ id: language.lang } as Language)
      const localizations = await LocalizationManager.fetchAll()
      expect(localizations.length).toEqual(language.expectedAmount)
      localizations.forEach(localization => {
        expect(localization.language).toEqual(language.lang)
      })
    })
  })

  it('should throw a NotFoundError if no Localizations are found', async () => {
    jest.spyOn(supabase, 'from').mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          throwOnError: () => ({ data: [] }),
        }),
      }),
    })
    await expect(LocalizationManager.fetchAll()).rejects.toThrow(NotFoundError)
  })
})

describe('getValue', () => {
  beforeEach(() => {
    LocalizationManager['_items'] = undefined
  })

  it('should return the localized value when item exists', async () => {
    const testKey = 'app_name'
    const testValue = 'Test App Name'

    // Mock the items with our test data
    LocalizationManager['set']([{ id: testKey, language: 'nb', value: testValue } as Localization])

    const result = LocalizationManager.getValue(testKey)
    expect(result).toBe(testValue)
  })

  it('should return default value when item does not exist', () => {
    const testKey = 'app_name'
    const result = LocalizationManager.getValue(testKey)
    expect(result).toBe('Brisen') // This is the default value from LocalizationDefaults
  })

  it('should handle all keys from LocalizationDefaults', () => {
    // Test a few different keys to ensure type safety
    const testCases = [
      { key: 'app_name', expected: 'Brisen' },
      { key: 'today', expected: 'Today' },
      { key: 'tomorrow', expected: 'Tomorrow' },
      { key: 'in_one_week', expected: 'in one week' },
    ] satisfies { key: LocalizationKey; expected: string }[]

    testCases.forEach(({ key, expected }) => {
      const result = LocalizationManager.getValue(key)
      expect(result).toBe(expected)
    })
  })
})
