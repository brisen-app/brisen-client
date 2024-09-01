import { Language, LanguageManager } from '@/src/managers/LanguageManager'
const { ConfigurationManager } = require('@/managers/ConfigurationManager')
const expoLocalization = require('expo-localization')

const mockedItems = [
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
] as Language[]

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

const eq = (key: 'id', value: string) => ({
  single: () => ({
    throwOnError: () => ({
      data: mockedItems.find(item => item[key] === value),
    }),
  }),
})

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        throwOnError: () => ({ data: mockedItems }),
        eq,
      }),
    }),
  },
}))

beforeEach(() => {
  LanguageManager['_items'] = undefined
  LanguageManager['_displayLanguage'] = undefined
})

describe('findUserLanguage', () => {
  beforeAll(() => {
    expoLocalization.getLocales = jest.fn().mockReturnValue(mockedLocales)
  })

  afterAll(() => {
    expoLocalization.getLocales.mockRestore()
  })

  it('should return the first public language that matches the user locale', () => {
    const displayLanguage = LanguageManager['findUserLanguage'](mockedItems)

    expect(displayLanguage!.id).toEqual('en')
  })

  it('should return undefined if no public language matches the user locale', () => {
    const languageItems = [{ id: 'en', name: 'English', public: false }] as Language[]
    const displayLanguage = LanguageManager['findUserLanguage'](languageItems)

    expect(displayLanguage).toBeUndefined()
  })
})

describe('findDefaultLanguage', () => {
  beforeAll(() => {
    ConfigurationManager.get = jest.fn().mockReturnValue({ string: 'nb' })
  })

  afterAll(() => {
    ConfigurationManager.get.mockRestore()
  })

  it('should return the default language if it exists', () => {
    const defaultLanguage = LanguageManager['findDefaultLanguage'](mockedItems)

    expect(defaultLanguage.id).toEqual('nb')
  })

  it('should return the first language if the default language does not exist', () => {
    const mockedItems = [
      {
        id: 'en',
        name: 'English',
        public: false,
      },
      {
        id: 'ru',
        name: 'Русский',
        public: true,
      },
    ] as Language[]

    const spyError = jest.spyOn(console, 'error').mockImplementation(() => {})
    const defaultLanguage = LanguageManager['findDefaultLanguage'](mockedItems)

    expect(defaultLanguage.id).toBe('ru')
    expect(spyError).toHaveBeenCalledTimes(1)
  })
})

describe('getDisplayLanguage', () => {
  it('should return the display language', () => {
    LanguageManager['_displayLanguage'] = mockedItems[1]
    const displayLanguage = LanguageManager.getDisplayLanguage()

    expect(displayLanguage).toEqual(mockedItems[1])
  })

  it('should throw an error if no display language is set', () => {
    const displayLanguage = () => LanguageManager.getDisplayLanguage()

    expect(displayLanguage).toThrow(Error)
  })
})

describe('set', () => {
  beforeAll(() => {
    ConfigurationManager.get = jest.fn().mockReturnValue({ string: 'nb' })
  })

  afterAll(() => {
    ConfigurationManager.get.mockRestore()
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
      expectedLangCode: 'nb',
    },
  ]

  testCases.forEach(({ userLocales, expectedLangCode }) => {
    it(`should set the display language to '${expectedLangCode}' when user locales is [${userLocales
      .map(l => l.languageCode)
      .join(', ')}]`, () => {
      expoLocalization.getLocales = jest.fn().mockReturnValue(userLocales)

      // @ts-ignore
      LanguageManager.set(mockedItems)
      const displayLanguage = LanguageManager.getDisplayLanguage()

      expect(expoLocalization.getLocales).toHaveBeenCalledTimes(1)
      expect(displayLanguage?.id).toEqual(expectedLangCode)
    })
  })

  it('should warn if items have already been set', () => {
    console.warn = jest.fn()

    LanguageManager['set'](mockedItems)
    LanguageManager['set'](mockedItems)

    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('should set the display language to defaultLanguage if no public languages are found', () => {
    const noPublicItems = [
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
    ] as Language[]

    LanguageManager['set'](noPublicItems)
    const displayLanguage = LanguageManager.getDisplayLanguage()

    expect(displayLanguage.id).toEqual('nb')
  })

  it('should throw an error if no languages are available', () => {
    const noMatchingItems = [
      {
        id: 'en',
        name: 'English',
        public: false,
      },
      {
        id: 'ru',
        name: 'Русский',
        public: false,
      },
    ] as Language[]

    const act = () => LanguageManager['set'](noMatchingItems)

    expect(act).toThrow(Error)
  })

  it('should set the display language to the safe-for-work language if the configuration is set', () => {
    const sfwItems = [
      ...mockedItems,
      {
        id: 'sfw',
        name: 'Safe-for-work',
        public: true,
      },
    ] as Language[]

    ConfigurationManager.get = jest.fn().mockReturnValue({ bool: true, string: 'sfw' })

    LanguageManager['set'](sfwItems)
    const displayLanguage = LanguageManager.getDisplayLanguage()

    expect(ConfigurationManager.get).toHaveBeenCalledTimes(2)
    expect(displayLanguage.id).toEqual('sfw')
  })
})
