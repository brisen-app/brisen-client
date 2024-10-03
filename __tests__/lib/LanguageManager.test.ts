import { Language, LanguageManager, SupabaseLanguage } from '@/src/managers/LanguageManager'
const { ConfigurationManager } = require('@/src/managers/ConfigurationManager')
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
  {
    id: 'default',
    name: 'Default',
    public: true,
  },
] as SupabaseLanguage[]

const mockedItemMap = new Map(mockedItems.map(item => [item.id, item])) as Map<string, SupabaseLanguage>

const mockedLocales = [
  { languageCode: 'aa' },
  { languageCode: 'ru' },
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

jest.mock('@/src/lib/supabase', () => ({
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
  expoLocalization.getLocales = jest.fn().mockReturnValue(mockedLocales)
  LanguageManager['_items'] = undefined
  LanguageManager['_displayLanguage'] = undefined
  LanguageManager['_userSelectedLanguage'] = undefined
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

describe('hasChangedLanguage', () => {
  it('should return true if the display language has changed', () => {
    LanguageManager['_userSelectedLanguage'] = 'en'
    const hasChanged = LanguageManager.hasChangedLanguage()

    expect(hasChanged).toBeTruthy()
  })

  it('should return false if the display language has not changed', () => {
    LanguageManager['_userSelectedLanguage'] = 'aa'
    const hasChanged = LanguageManager.hasChangedLanguage()

    expect(hasChanged).toBeFalsy()
  })

  it('should return false if no user locales are found', () => {
    expoLocalization.getLocales = jest.fn().mockReturnValue([])
    const hasChanged = LanguageManager.hasChangedLanguage()

    expect(hasChanged).toBeFalsy()
  })
})

describe('updateDisplayLanguage', () => {
  it('should update the display language to the first public language', () => {
    LanguageManager['_items'] = mockedItemMap

    LanguageManager.updateDisplayLanguage()

    expect(LanguageManager['_displayLanguage']?.['id']).toEqual(mockedItems[0].id)
    expect(LanguageManager['_userSelectedLanguage']).toEqual('aa')
  })

  it('should update the display language to the safe-for-work language if the configuration is set', () => {
    LanguageManager['_items'] = mockedItemMap
    LanguageManager['_items'].set('sfw', { id: 'sfw', name: 'Safe-for-work', public: true } as SupabaseLanguage)
    ConfigurationManager.get = jest.fn().mockReturnValue({ string: 'sfw', bool: true })

    LanguageManager.updateDisplayLanguage()

    expect(LanguageManager['_displayLanguage']?.['id']).toEqual('sfw')
  })

  it('should throw an error if the SFW language ID is not found', () => {
    ConfigurationManager.get = jest.fn().mockReturnValue({ bool: true })

    const act = () => LanguageManager.updateDisplayLanguage()

    expect(act).toThrow('Safe-for-work language ID not found')
  })

  it('should throw an error if the SFW language data is not found', () => {
    ConfigurationManager.get = jest.fn().mockReturnValue({ string: 'sfw', bool: true })

    const act = () => LanguageManager.updateDisplayLanguage()

    expect(act).toThrow('Safe-for-work language data not found')
  })

  it('should use the default language if no matching language is found', () => {
    ConfigurationManager.get = jest.fn().mockReturnValue({ string: 'default' })
    LanguageManager['_items'] = new Map<string, SupabaseLanguage>()
    LanguageManager['_items'].set('default', { id: 'default', name: 'Default', public: true } as SupabaseLanguage)

    LanguageManager.updateDisplayLanguage()

    expect(LanguageManager['_displayLanguage']?.['id']).toEqual('default')
  })

  it('should throw an error if the default language is not found', () => {
    ConfigurationManager.get = jest.fn().mockReturnValue({ string: 'default' })

    const act = () => LanguageManager.updateDisplayLanguage()

    expect(act).toThrow('Default language not found')
  })
})

describe('set', () => {
  beforeAll(() => {
    ConfigurationManager.get = jest.fn().mockReturnValue({ string: 'default' })
  })

  afterAll(() => {
    ConfigurationManager.get.mockRestore()
  })

  it('should store the provided languages', () => {
    LanguageManager['set'](mockedItems)

    expect(Array.from(LanguageManager['_items']?.keys() || [])).toEqual(['en', 'nb', 'ru', 'default'])
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
      expectedLangCode: 'default',
    },
  ]

  testCases.forEach(({ userLocales, expectedLangCode }) => {
    it(`should set the display language to '${expectedLangCode}' when user locales is [${userLocales
      .map(l => l.languageCode)
      .join(', ')}]`, () => {
      expoLocalization.getLocales = jest.fn().mockReturnValue(userLocales)

      LanguageManager['set'](mockedItems)
      const displayLanguage = LanguageManager.getDisplayLanguage()

      expect(expoLocalization.getLocales).toHaveBeenCalledTimes(1)
      expect(displayLanguage?.id).toEqual(expectedLangCode)
    })
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
