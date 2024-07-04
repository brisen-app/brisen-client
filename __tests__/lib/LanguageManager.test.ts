import { LanguageManager, defaultLanguage } from '@/managers/LanguageManager'
import { Tables } from '@/models/supabase'

const mockedItems: Partial<Tables<'languages'>>[] = [
  {
    id: 'en',
    name: 'English',
    public: true,
  },
  {
    id: 'nb',
    name: 'Norsk',
    public: true,
  },
  {
    id: 'ru',
    name: 'Русский',
    public: false,
  },
]

const mockedLocales = [
  { languageCode: 'aa' },
  { languageCode: 'en' },
  { languageCode: 'random' },
  { languageCode: null },
  { languageCode: 'nb' },
  { languageCode: '' },
]

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        throwOnError: () => ({ data: mockedItems }),
        eq: (key: 'id', value: string) => ({
          single: () => ({
            throwOnError: () => ({
              data: mockedItems.find(item => item[key] === value),
            }),
          }),
        }),
      }),
    }),
  },
}))

beforeEach(() => {
  // @ts-ignore
  LanguageManager._items = null
  // @ts-ignore
  LanguageManager._displayLanguage = null
})

describe('getDisplayLanguage', () => {
  it('should return the display language', () => {
    // @ts-ignore
    LanguageManager._displayLanguage = mockedItems[1]
    const displayLanguage = LanguageManager.getDisplayLanguage()

    expect(displayLanguage).toEqual(mockedItems[1])
  })
})

describe('set', () => {
  const expoLocalization = require('expo-localization')

  beforeEach(() => {
    expoLocalization.getLocales = jest.fn().mockReturnValue(mockedLocales)
  })

  const testCases = [
    {
      userLocales: [{ languageCode: 'en' }, { languageCode: 'nb' }],
      expectedLangCode: 'en',
    },
    {
      userLocales: [{ languageCode: 'nb' }, { languageCode: 'en' }],
      expectedLangCode: 'nb',
    },
    {
      userLocales: [],
      expectedLangCode: defaultLanguage.id,
    },
  ]

  testCases.forEach(({ userLocales, expectedLangCode }) => {
    it(`should set the display language to '${expectedLangCode}' when user locales is '${userLocales}'`, () => {
      expoLocalization.getLocales = jest.fn().mockReturnValueOnce(userLocales)

      // @ts-ignore
      LanguageManager.set(mockedItems)
      const displayLanguage = LanguageManager.getDisplayLanguage()

      expect(expoLocalization.getLocales).toHaveBeenCalledTimes(1)
      expect(displayLanguage?.id).toEqual(expectedLangCode)
    })
  })

  it('should warn if items have already been set', () => {
    console.warn = jest.fn()
    // @ts-ignore
    LanguageManager.set(mockedLocales)
    // @ts-ignore
    LanguageManager.set(mockedLocales)
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('should set the display language to defaultLanguage if no public languages are found', () => {
    const noPublicItems: Partial<Tables<'languages'>>[] = [
      {
        id: 'en',
        name: 'English',
        public: false,
      },
      {
        id: 'nb',
        name: 'Norsk',
        public: false,
      },
      {
        id: 'ru',
        name: 'Русский',
        public: false,
      },
    ]

    // @ts-ignore
    LanguageManager.set(noPublicItems)
    const displayLanguage = LanguageManager.getDisplayLanguage()

    expect(displayLanguage).toEqual(defaultLanguage)
  })
})
