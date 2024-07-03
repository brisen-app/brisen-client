// @ts-nocheck

import { Category, CategoryManager } from '@/managers/CategoryManager'
import { Localization, LocalizationManager } from '@/managers/LocalizationManager'

const mockedLocalizations: Localization[] = [
  { id: 'categories_1_title', value: 'Alice' },
  { id: 'categories_2_title', value: 'Bob' },
  { id: 'categories_3_title', value: 'Charlie' },
  { id: 'categories_1_desc', value: 'Alice description' },
]

const mockedItems: Category[] = [
  {
    id: '1',
    icon: '1️⃣',
    gradient: ['red', 'blue'],
    created_at: '2021-01-01T00:00:00.000Z',
    modified_at: '2021-01-01T00:00:00.000Z',
  },
  {
    id: '3',
    icon: '3️⃣',
    gradient: ['yellow', 'green'],
    created_at: '2021-01-01T00:00:00.000Z',
    modified_at: '2021-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    icon: '2️⃣',
    gradient: ['purple', 'orange'],
    created_at: '2021-01-01T00:00:00.000Z',
    modified_at: '2021-01-01T00:00:00.000Z',
  },
]

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        throwOnError: () => ({ data: mockedItems }),
      }),
    }),
  },
}))

jest.mock('@/lib/LocalizationManager', () => ({
  LocalizationManager: {
    get: (id: string) => mockedLocalizations.find(title => title.id === id),
  },
}))

beforeEach(() => {
  CategoryManager['_items'] = null
})

describe('items', () => {
  it('should return categories sorted by localized title', () => {
    CategoryManager.set(mockedItems)
    expect(CategoryManager.items).toEqual([mockedItems[0], mockedItems[2], mockedItems[1]])
  })

  it('should return undefined if categories havent been fetched yet', () => {
    const result = CategoryManager.items
    expect(result).toBeUndefined()
  })
})

describe('getTitle', () => {
  it('should return the correct title', () => {
    const result = CategoryManager.getTitle(mockedItems[0])
    expect(result).toEqual('Alice')
  })
})

describe('getDescription', () => {
  it('should return the correct description', () => {
    const result = CategoryManager.getDescription(mockedItems[0])
    expect(result).toEqual('Alice description')
  })
})
