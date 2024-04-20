// @ts-nocheck

import { LanguageManager } from '@/lib/LanguageManager'
import { LocalizationManager, Localization } from '@/lib/LocalizationManager'
import { supabase } from '@/lib/supabase'
import { NotFoundError } from '@/types/Errors'

const mockedItems: Localization[] = [
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
                                data: mockedItems.find(
                                    (item) => item[columnName1] === value1 && item[columnName2] === value2
                                ),
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
        getLanguage: () => ({ id: 'nb' }),
    },
}))

beforeEach(() => {
    LocalizationManager['cache'] = null
})

describe('getFetchAllQuery', () => {
    it('should return a query object with the correct queryKey and queryFn', () => {
        const fetchAllSpy = jest
            .spyOn(LocalizationManager, 'fetchAll')
            .mockReturnValueOnce(Promise.resolve(mockedItems))
        const query = LocalizationManager.getFetchAllQuery()
        expect(query.queryKey).toEqual(['localizations', 'nb'])
        expect(query.queryFn).toBeDefined()
        // Call the queryFn
        query.queryFn()
        // Assert that LocalizationManager.fetchAll has been called
        expect(fetchAllSpy).toHaveBeenCalled()
    })
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
        await expect(LocalizationManager.fetch(id)).rejects.toThrow(`No data found in table 'localizations'`)
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
    beforeEach(() => {
        LocalizationManager['cache'] = null
    })

    const testCases = [
        { lang: 'nb', expectedAmount: 2 },
        { lang: 'en', expectedAmount: 1 },
    ]

    testCases.forEach((language) => {
        it(`should return all Localizations with language ${language}`, async () => {
            jest.spyOn(LanguageManager, 'getLanguage').mockReturnValueOnce({ id: language.lang })
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
                    throwOnError: () => ({ data: [] }),
                }),
            }),
        })
        await expect(LocalizationManager.fetchAll()).rejects.toThrow(`No data found in table 'localizations'`)
    })
})

describe('items', () => {
    it('should return the correct items', () => {
        LocalizationManager.set(mockedItems)
        expect(LocalizationManager.items).toEqual(new Set(mockedItems))
    })

    it('should throw NotFoundError if categories have not been fetched yet', () => {
        expect(() => LocalizationManager.items).toThrow(NotFoundError)
    })
})

describe('get', () => {
    it('should throw if id is invalid', () => {
        expect(() => LocalizationManager.get(null)).toThrow(NotFoundError)
    })

    it('should throw NotFoundError if categories have not been fetched yet', () => {
        expect(() => LocalizationManager.get('some_id')).toThrow(NotFoundError)
    })

    it('should throw NotFoundError if category with specified id is not found', () => {
        LocalizationManager.set(mockedItems)
        const item = LocalizationManager.get('non_existing_id')
        expect(item).toBe(null)
    })

    const testCases = [
        { id: '1', expected: mockedItems[0] },
        { id: '3', expected: mockedItems[1] },
    ]

    testCases.forEach(({ id, expected }) => {
        it(`should return the item if found`, () => {
            LocalizationManager.set(mockedItems)
            const result = LocalizationManager.get(id)
            expect(result).toBe(expected)
        })
    })
})

describe('set', () => {
    it('should set items correctly', () => {
        const items: Localization[] = [{ id: '1' }, { id: '2' }] as Localization[]
        LocalizationManager.set(items)
        expect(LocalizationManager['cache']).toContain(items[0])
        expect(LocalizationManager['cache']).toContain(items[1])
    })
})