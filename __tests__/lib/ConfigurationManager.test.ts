import { Configuration, ConfigurationKey, ConfigurationManager } from '@/src/managers/ConfigurationManager'

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Suppress console.warn messages
console.warn = jest.fn()

jest.mock('@/src/lib/supabase', () => ({
  supabase: undefined,
}))

beforeEach(() => {
  ConfigurationManager['set']([
    { id: 'use_sfw_content', data_type: 'bool', bool: true } as Configuration,
    { id: 'default_gradient', data_type: 'list', list: ['red', 'blue'] } as Configuration,
    { id: 'bottom_sheet_min_position', data_type: 'number', number: 64 } as Configuration,
    { id: 'brisen_plus_id', data_type: 'string', string: 'brisen_plus' } as Configuration,
  ])
})

afterEach(() => {
  ConfigurationManager['_items'] = undefined
})

describe('getValue', () => {
  const cases = [
    { key: 'use_sfw_content', expected: true },
    { key: 'default_gradient', expected: ['red', 'blue'] },
    { key: 'bottom_sheet_min_position', expected: 64 },
    { key: 'brisen_plus_id', expected: 'brisen_plus' },
  ] satisfies { key: ConfigurationKey; expected: unknown }[]

  it.each(cases)('should return the value for key: %s', ({ key, expected }) => {
    expect(ConfigurationManager.getValue(key)).toEqual(expected)
  })

  it('should return undefined if the key is not found', () => {
    // @ts-expect-error
    expect(ConfigurationManager.getValue('not_found')).toBeUndefined()
  })
})
