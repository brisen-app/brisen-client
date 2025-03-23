import { Category, CategoryManager } from '@/src/managers/CategoryManager'

const mockedLocalizations = new Map([
  ['categories_1_title', 'Alice'],
  ['categories_2_title', 'Bob'],
  ['categories_3_title', 'Charlie'],
  ['categories_1_description', 'Alice description'],
])

const mockedItems: Category[] = [
  {
    id: '1',
    icon: '1️⃣',
    gradient: ['red', 'blue'],
  } as Category,
  {
    id: '3',
    icon: '3️⃣',
    gradient: ['yellow', 'green'],
  } as Category,
  {
    id: '2',
    icon: '2️⃣',
    gradient: ['purple', 'orange'],
  } as Category,
]

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        throwOnError: () => ({ data: mockedItems }),
      }),
    }),
  },
}))

jest.mock('@/src/managers/LocalizationManager', () => ({
  LocalizationManager: {
    getValue: (id: string) => mockedLocalizations.get(id),
  },
}))

beforeEach(() => {
  CategoryManager['_items'] = undefined
})

describe('items', () => {
  it('should return categories sorted by localized title', () => {
    CategoryManager['set'](mockedItems)
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
