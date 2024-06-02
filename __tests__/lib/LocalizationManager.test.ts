import { LanguageManager } from '@/lib/LanguageManager'
import { LocalizationManager, Localization } from '@/lib/LocalizationManager'
import { supabase } from '@/lib/supabase'
import { NotFoundError } from '@/models/Errors'

const mockedItems: Localization[] = [
  // @ts-ignore
  {
    id: '1',
    language: 'nb',
    value: 'Content of Localization 1',
  },
  // @ts-ignore
  {
    id: '3',
    language: 'en',
    value: 'Content of Localization 3',
  },
  // @ts-ignore
  {
    id: '2',
    language: 'nb',
    value: 'Content of Localization 2',
  },
]

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: (columnName1: keyof Localization, value1: string) => ({
          throwOnError: () => ({ data: mockedItems.filter((item) => item[columnName1] === value1) }),
          eq: (columnName2: keyof Localization, value2: string) => ({
            single: () => ({
              throwOnError: () => ({
                data: mockedItems.find((item) => item[columnName1] === value1 && item[columnName2] === value2),
              }),
            }),
          }),
        }),
      }),
    }),
  },
}))

jest.mock('@/lib/LanguageManager', () => ({
  LanguageManager: {
    getDisplayLanguage: () => ({ id: 'nb' }),
  },
}))

beforeEach(() => {
  // @ts-ignore
  LocalizationManager['_items'] = null
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
        // @ts-ignore
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

  testCases.forEach((language) => {
    it(`should return all Localizations with language ${language}`, async () => {
      // @ts-ignore
      jest.spyOn(LanguageManager, 'getDisplayLanguage').mockReturnValueOnce({ id: language.lang })
      const localizations = await LocalizationManager.fetchAll()
      expect(localizations.length).toEqual(language.expectedAmount)
      localizations.forEach((localization) => {
        expect(localization.language).toEqual(language.lang)
      })
    })
  })

  it('should throw a NotFoundError if no Localizations are found', async () => {
    jest.spyOn(supabase, 'from').mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          // @ts-ignore
          throwOnError: () => ({ data: [] }),
        }),
      }),
    })
    await expect(LocalizationManager.fetchAll()).rejects.toThrow(NotFoundError)
  })
})
