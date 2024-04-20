// @ts-nocheck

import { Category, CategoryManager } from '@/lib/CategoryManager'
import { supabase } from '@/lib/supabase'
import { NotFoundError } from '@/types/Errors'

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

describe('getFetchAllQuery', () => {
    it('should return a query object with the correct queryKey and queryFn', () => {
        const fetchAllSpy = jest.spyOn(CategoryManager, 'fetchAll')
        const query = CategoryManager.getFetchAllQuery()
        expect(query.queryKey).toEqual(['categories'])
        expect(query.queryFn).toBeDefined()
        // Call the queryFn
        query.queryFn()
        // Assert that CategoryManager.fetchAll has been called
        expect(fetchAllSpy).toHaveBeenCalled()
    })
})

describe('items', () => {
    beforeEach(() => {
        CategoryManager['cache'] = null
    })

    it('should return the correct items', () => {
        CategoryManager.set(mockedItems)
        expect(CategoryManager.items).toEqual(new Set(mockedItems))
    })

    it('should throw NotFoundError if categories have not been fetched yet', () => {
        expect(() => CategoryManager.items).toThrow(NotFoundError)
    })
})

describe('get', () => {
    beforeEach(() => {
        CategoryManager['cache'] = null
    })

    it('should throw if id is invalid', () => {
        expect(() => CategoryManager.get(null)).toThrow(NotFoundError)
    })

    it('should throw NotFoundError if categories have not been fetched yet', () => {
        expect(() => CategoryManager.get('some_id')).toThrow(NotFoundError)
    })

    it('should throw NotFoundError if category with specified id is not found', () => {
        CategoryManager.set([{ id: 'existing_id' } as Category])
        expect(() => CategoryManager.get('non_existing_id')).toThrow(NotFoundError)
    })

    const testCases = [
        { id: '1', expected: mockedItems[0] },
        { id: '3', expected: mockedItems[1] },
    ]

    testCases.forEach(({ id, expected }) => {
        it(`should return the category if found`, () => {
            CategoryManager.set(mockedItems)
            const result = CategoryManager.get(id)
            expect(result).toBe(expected)
        })
    })
})

describe('set', () => {
    beforeEach(() => {
        CategoryManager['cache'] = null
    })

    it('should set categories correctly', () => {
        const categories: Category[] = [{ id: '1' }, { id: '2' }] as Category[]
        CategoryManager.set(categories)
        expect(CategoryManager['cache']).toContain(categories[0])
        expect(CategoryManager['cache']).toContain(categories[1])
    })
})

describe('fetchAll', () => {
    beforeEach(() => {
        CategoryManager['cache'] = null
    })
    
    it('should fetch all categories successfully', async () => {
        const categories = await CategoryManager['fetchAll']()
        expect(categories).toEqual(mockedItems)
    })

    it('should throw NotFoundError if no data found', async () => {
        jest.spyOn(supabase, 'from').mockReturnValueOnce({
            select: () => ({
                throwOnError: () => ({ data: [] }),
            }),
        })
        await expect(CategoryManager.fetchAll()).rejects.toThrow(`No data found in table 'categories'`)
    })
})

describe('getTitleLocaleKey', () => {
    it('should return the correct title locale key', () => {
        const category: Category = { id: 'category_id' } as Category
        const result = CategoryManager.getTitleLocaleKey(category)
        expect(result).toBe(`${CategoryManager.tableName}_${category.id}_title`)
    })
})

describe('getDescLocaleKey', () => {
    it('should return the correct description locale key', () => {
        const category: Category = { id: 'category_id' } as Category
        const result = CategoryManager.getDescLocaleKey(category)
        expect(result).toBe(`${CategoryManager.tableName}_${category.id}_desc`)
    })
})
