import { ConfigurationKey, ConfigurationManager } from '@/src/managers/ConfigurationManager'
import { Language, LanguageManager, SupabaseLanguage } from '@/src/managers/LanguageManager'
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
  {
    id: 'sfw',
    name: 'Safe for work',
    public: true,
  },
] as SupabaseLanguage[]

const mockedItemMap = new Map(mockedItems.map(item => [item.id, item]))

const mockedLocales = [
  { languageCode: 'aa' },
  { languageCode: 'ru' },
  { languageCode: 'en' },
  { languageCode: 'default' },
  { languageCode: 'random' },
  { languageCode: null },
  { languageCode: 'nb' },
  { languageCode: '' },
]

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Suppress console.warn messages
console.warn = jest.fn()

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

const mockedGetValues = (arg: ConfigurationKey) => {
  switch (arg) {
    case 'default_language':
      return 'default'
    case 'use_sfw_content':
      return false
    case 'sfw_language':
      return 'sfw'
    default:
      throw new Error(`Unknown key: ${arg}`)
  }
}

beforeEach(() => {
  expoLocalization.getLocales = jest.fn().mockReturnValue(mockedLocales)
  jest.spyOn(ConfigurationManager, 'getValue').mockImplementation(mockedGetValues)
  LanguageManager['set'](mockedItems)
})

afterEach(() => {
  LanguageManager['_items'] = undefined
  LanguageManager['_detectedLanguage'] = undefined
  LanguageManager['_userSelectedLanguage'] = undefined
  jest.clearAllMocks()
  jest.restoreAllMocks()
})

describe('getDisplayLanguage', () => {
  it('should return the display language', () => {
    LanguageManager['_detectedLanguage'] = mockedItems[1]
    const displayLanguage = LanguageManager.getLanguage()

    expect(displayLanguage).toEqual(mockedItems[1])
  })

  it('should throw an error if no display language is set', () => {
    LanguageManager['_detectedLanguage'] = undefined

    const displayLanguage = () => LanguageManager.getLanguage()

    expect(displayLanguage).toThrow(Error)
  })
})

describe('hasChangedLanguage', () => {
  it('should return true if the display language has changed', () => {
    LanguageManager['_userSelectedLanguage'] = { id: 'en' } as Language
    const hasChanged = LanguageManager.hasChangedLanguage()

    expect(hasChanged).toBeTruthy()
  })

  it('should return false if the SFW configuration is set', () => {
    jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(true)

    const hasChanged = LanguageManager.hasChangedLanguage()

    expect(hasChanged).toBeFalsy()
  })

  it('should return false if the display language has not changed', () => {
    LanguageManager['_detectedLanguage'] = { id: 'aa' } as Language
    LanguageManager['_userSelectedLanguage'] = { id: 'aa' } as Language
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
  it('should update the detected language to the first public language', () => {
    LanguageManager['_items'] = mockedItemMap

    LanguageManager.detectLanguage()

    expect(LanguageManager['_detectedLanguage']?.['id']).toEqual(mockedItems[0].id)
    expect(LanguageManager['_userSelectedLanguage']).toBeUndefined()
  })

  it('should update the display language to the safe-for-work language if the configuration is set', () => {
    jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(true).mockReturnValueOnce('sfw')

    LanguageManager.detectLanguage()

    expect(LanguageManager['_detectedLanguage']?.['id']).toEqual('sfw')
  })

  it('should throw an error if the SFW language ID is not found', () => {
    jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(true).mockReturnValueOnce(undefined)
    LanguageManager['_items'] = new Map([
      ['default', { id: 'default', name: 'Default', public: true } as SupabaseLanguage],
    ])
    const act = () => LanguageManager.detectLanguage()

    expect(act).toThrow('Safe-for-work language ID not found')
  })

  it('should throw an error if the SFW language data is not found', () => {
    jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(true).mockImplementation(mockedGetValues)
    LanguageManager['_items'] = new Map<string, SupabaseLanguage>()
    LanguageManager['_items'].set('default', { id: 'default', name: 'Default', public: true } as SupabaseLanguage)

    const act = () => LanguageManager.detectLanguage()

    expect(act).toThrow('Safe-for-work language data not found')
  })

  it('should use the default language if no matching language is found', () => {
    LanguageManager['_items'] = new Map([
      ['default', { id: 'default', name: 'Default', public: true } as SupabaseLanguage],
    ])

    LanguageManager.detectLanguage()

    expect(LanguageManager['_detectedLanguage']?.['id']).toEqual('default')
  })

  it('should throw an error if the default language is not found', () => {
    LanguageManager['_items'] = new Map<string, SupabaseLanguage>()

    const act = () => LanguageManager.detectLanguage()

    expect(act).toThrow('Default language not found')
  })
})

describe('set', () => {
  it('should store the provided languages', () => {
    LanguageManager['set'](mockedItems)

    expect(Array.from(LanguageManager['_items']?.keys() || [])).toEqual(['en', 'nb', 'ru', 'default', 'sfw'])
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
      const displayLanguage = LanguageManager.getLanguage()

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
    jest.spyOn(ConfigurationManager, 'getValue').mockReturnValueOnce(true).mockImplementation(mockedGetValues)

    LanguageManager['_items'] = undefined
    LanguageManager['set'](mockedItems)
    const displayLanguage = LanguageManager.getLanguage()

    expect(displayLanguage.id).toEqual('sfw')
  })
})
