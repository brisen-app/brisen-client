import { Card, CardManager } from '@/lib/CardManager'
import { CardRelation, CardRelationManager } from '@/lib/CardRelationManager'
import { CycleError } from '@/models/Errors'

const mockedRelations1 = [
  { parent: '1', child: '2' },
  { parent: '1', child: '3' },
  { parent: '3', child: '4' },
  { parent: '2', child: '5' },
  { parent: '4', child: '5' },
  { parent: '4', child: '6' },
] as CardRelation[]

const mockedRelations2 = [
  { parent: '6', child: '3' },
  { parent: '5', child: '3' },
  { parent: '4', child: '3' },
  { parent: '4', child: '2' },
  { parent: '3', child: '1' },
] as CardRelation[]

const mockedRelationsWithCycle = [
  { parent: '1', child: '2' },
  { parent: '1', child: '3' },
  { parent: '3', child: '4' },
  { parent: '4', child: '5' },
  { parent: '5', child: '3' },
] as CardRelation[]

const mockedRelationsWithCycleNoRoot = [
  { parent: '1', child: '2' },
  { parent: '2', child: '3' },
  { parent: '3', child: '4' },
  { parent: '4', child: '1' },
  { parent: '4', child: '5' },
  { parent: '5', child: '6' },
  { parent: '6', child: '3' },
] as CardRelation[]

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        throwOnError: () => ({ data: mockedRelations1 }),
      }),
    }),
  },
}))

beforeEach(() => {
  // @ts-ignore
  CardRelationManager._items = null
  // @ts-ignore
  CardRelationManager.children = new Map()
  // @ts-ignore
  CardRelationManager.parents = new Map()
})

describe('set', () => {
  const testCases = [
    {
      relations: mockedRelations1,
      expectedChildren: new Map([
        ['1', new Set(['2', '3'])],
        ['2', new Set(['5'])],
        ['3', new Set(['4'])],
        ['4', new Set(['5', '6'])],
      ]),
      expectedParents: new Map([
        ['2', new Set(['1'])],
        ['3', new Set(['1'])],
        ['4', new Set(['3'])],
        ['5', new Set(['2', '4'])],
        ['6', new Set(['4'])],
      ]),
    },
    {
      relations: mockedRelations2,
      expectedChildren: new Map([
        ['6', new Set(['3'])],
        ['5', new Set(['3'])],
        ['4', new Set(['3', '2'])],
        ['3', new Set(['1'])],
      ]),
      expectedParents: new Map([
        ['1', new Set(['3'])],
        ['2', new Set(['4'])],
        ['3', new Set(['4', '5', '6'])],
      ]),
    },
  ]

  testCases.forEach(({ relations, expectedChildren, expectedParents }) => {
    it('should build the graph correctly', () => {
      // @ts-ignore
      CardRelationManager.set(relations)
      // @ts-ignore
      expect(CardRelationManager.children).toEqual(expectedChildren)
      // @ts-ignore
      expect(CardRelationManager.parents).toEqual(expectedParents)
    })
  })

  it('should throw an error if there is a cycle', () => {
    // @ts-ignore
    expect(() => CardRelationManager.set(mockedRelationsWithCycle)).toThrow(CycleError)
  })
})

describe('getUnplayedParent', () => {
  it('should return an unplayed parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['1', '2', '5', '6'])

    const result = CardRelationManager.getUnplayedParent('5', candidates)

    expect(result).toBe('1')
  })

  // it('should return an unplayed parent', () => {
  //   // @ts-ignore
  //   CardRelationManager.set(mockedRelations2)
  //   const candidates = new Set(['1', '3', '4'])

  //   const result = CardRelationManager.getUnplayedParent('1', candidates)

  //   expect(result).toBe('4')
  // })

  it('should return itself if there is no unplayed parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['3', '4', '5', '6'])

    const result = CardRelationManager.getUnplayedParent('3', candidates)

    expect(result).toBe('3')
  })
})

describe('getRequiredPlayerCount', () => {
  const cardIds = ['1', '2', '3', '4', '5', '6']

  afterEach(() => {
    // @ts-ignore
    CardManager._items = null
    // @ts-ignore
    CardManager.cachedPlayerCounts = new Map()
    // @ts-ignore
    CardRelationManager.cachedPlayerCounts = new Map()
  })

  cardIds.forEach((id) => {
    it('should return the highest required player count', () => {
      // @ts-ignore
      CardRelationManager.set(mockedRelations1)
      // @ts-ignore
      CardManager.set([
        { id: '1', content: '{player-0}' },
        { id: '2', content: '' },
        { id: '3', content: '' },
        { id: '4', content: '' },
        { id: '5', content: '{player-10}' },
        { id: '6', content: '' },
      ] as Card[])

      const result = CardRelationManager.getRequiredPlayerCount(id)
      expect(result).toBe(11)
    })
  })

  cardIds.forEach((id) => {
    it('should return the highest required player count', () => {
      // @ts-ignore
      CardRelationManager.set(mockedRelations2)
      // @ts-ignore
      CardManager.set([
        { id: '1', content: '{player-1}' },
        { id: '2', content: '' },
        { id: '3', content: '{player-4}' },
        { id: '4', content: '' },
        { id: '5', content: '' },
        { id: '6', content: '' },
      ] as Card[])

      const result = CardRelationManager.getRequiredPlayerCount(id)
      expect(result).toBe(5)
    })
  })
})
