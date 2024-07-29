import { Card, CardManager } from '@/managers/CardManager'
import { CardRelation, CardRelationManager } from '@/managers/CardRelationManager'
import { CycleError } from '@/models/Errors'

const mockedRelations1 = [
  { id: '2:1', parent: '1', child: '2' },
  { id: '3:1', parent: '1', child: '3' },
  { id: '4:3', parent: '3', child: '4' },
  { id: '5:2', parent: '2', child: '5' },
  { id: '5:4', parent: '4', child: '5' },
  { id: '6:4', parent: '4', child: '6' },
] as CardRelation[]

const mockedRelations2 = [
  { id: '3:6', parent: '6', child: '3' },
  { id: '3:5', parent: '5', child: '3' },
  { id: '3:4', parent: '4', child: '3' },
  { id: '2:4', parent: '4', child: '2' },
  { id: '1:3', parent: '3', child: '1' },
] as CardRelation[]

const mockedRelations3 = [
  { id: '2:1', parent: '1', child: '2' },
  { id: '3:2', parent: '2', child: '3' },
  { id: '4:2', parent: '2', child: '4' },
  { id: '5:3', parent: '3', child: '5' },
  { id: '5:4', parent: '4', child: '5' },
  { id: '5:4', parent: '5', child: '6' },
] as CardRelation[]

const mockedRelationsWithCycle = [
  { id: '2:1', parent: '1', child: '2' },
  { id: '3:1', parent: '1', child: '3' },
  { id: '4:3', parent: '3', child: '4' },
  { id: '5:4', parent: '4', child: '5' },
  { id: '3:5', parent: '5', child: '3' },
] as CardRelation[]

const mockedRelationsWithCycleNoRoot = [
  { id: '2:1', parent: '1', child: '2' },
  { id: '3:2', parent: '2', child: '3' },
  { id: '4:3', parent: '3', child: '4' },
  { id: '1:4', parent: '4', child: '1' },
  { id: '5:4', parent: '4', child: '5' },
  { id: '6:5', parent: '5', child: '6' },
  { id: '3:6', parent: '6', child: '3' },
] as CardRelation[]

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

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

  it('should not throw an error if there is no cycle', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations3)
    // @ts-ignore
    expect(() => CardRelationManager.set(skiturStoryRelation)).not.toThrow(CycleError)
  })

  const cycles = [
    { graph: mockedRelationsWithCycle, cycle: ['3', '4', '5', '3'] },
    { graph: mockedRelationsWithCycleNoRoot, cycle: ['2', '3', '4', '1', '2'] },
  ]
  cycles.forEach(relations => {
    it(`should throw an error if there is a cycle`, () => {
      try {
        // @ts-ignore
        CardRelationManager.set(relations.graph)
      } catch (error) {
        expect(error).toBeInstanceOf(CycleError)
        expect((error as CycleError).nodes).toEqual(relations.cycle)
      }
    })
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

  it('should return an unplayed parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations2)
    const candidates = new Set(['1', '3', '4'])

    const result = CardRelationManager.getUnplayedParent('1', candidates)

    expect(result).toBe('4')
  })

  it('should return itself if there is no unplayed parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['3', '4', '5', '6'])

    const result = CardRelationManager.getUnplayedParent('3', candidates)

    expect(result).toBe('3')
  })

  it('should return null if there is no unplayed parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['1'])

    const result = CardRelationManager.getUnplayedParent('2', candidates)

    expect(result).toBe(null)
  })
})

describe('hasUnplayedParent', () => {
  it('should return true if the card has an unplayed parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['1', '2', '5', '6'])

    const result = CardRelationManager.hasUnplayedParent('5', candidates)

    expect(result).toBe(true)
  })

  it('should return false if the card has no unplayed parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['3', '4', '5', '6'])

    const result = CardRelationManager.hasUnplayedParent('3', candidates)

    expect(result).toBe(false)
  })

  it('should return false if the card has no parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const result = CardRelationManager.hasUnplayedParent('1', new Set<string>())

    expect(result).toBe(false)
  })
})

describe('hasUnplayedChild', () => {
  it('should return true if the card has an unplayed child', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['1', '2', '5', '6'])

    const result = CardRelationManager.hasUnplayedChild('1', candidates)

    expect(result).toBe(true)
  })

  it('should return false if the card has no unplayed child', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['1', '3', '4'])

    const result = CardRelationManager.hasUnplayedChild('4', candidates)

    expect(result).toBe(false)
  })

  it('should return false if the card has no child', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const result = CardRelationManager.hasUnplayedChild('1', new Set<string>())

    expect(result).toBe(false)
  })
})

describe('isPlayable', () => {
  it('should return true if the card is playable', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['1', '5', '6'])

    const result = CardRelationManager.isPlayable('5', candidates)

    expect(result).toBe(true)
  })

  it('should return false if the card is not playable', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['1', '2', '5', '6'])

    const result = CardRelationManager.isPlayable('5', candidates)

    expect(result).toBe(false)
  })

  it('should return false if the card is bit a candidate', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['3', '4', '5', '6'])

    const result = CardRelationManager.isPlayable('1', candidates)

    expect(result).toBe(false)
  })
})

describe('getPlayedParent', () => {
  it('should return an unplayed parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['1', '2', '5', '6'])

    const result = CardRelationManager.getPlayedParent('5', candidates)

    expect(result).toBe('2')
  })

  it('should return an unplayed parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations2)
    const candidates = new Set(['1', '3', '4'])

    const result = CardRelationManager.getPlayedParent('1', candidates)

    expect(result).toBe('3')
  })

  it('should return null if there is no unplayed parent', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const candidates = new Set(['3', '4', '5', '6'])

    const result = CardRelationManager.getPlayedParent('3', candidates)

    expect(result).toBe(null)
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

  cardIds.forEach(id => {
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

  cardIds.forEach(id => {
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

describe('getChildren', () => {
  it('should return an array of children', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const result = CardRelationManager.getChildren('1')
    expect(result).toEqual(new Set(['2', '3']))
  })
})

describe('fetchAll', () => {
  it('should return an array of relations', async () => {
    const result = await CardRelationManager.fetchAll()
    expect(result).toEqual(mockedRelations1)
  })
})

describe('isItem', () => {
  it('should return true if the object is a CardRelation', () => {
    const item = { id: '1', parent: '2', child: '3' }
    const result = CardRelationManager.isItem(item)
    expect(result).toBe(true)
  })

  it('should return false if the object is not a CardRelation', () => {
    const item = { id: '1', parent: '2' }
    const result = CardRelationManager.isItem(item)
    expect(result).toBe(false)
  })
})

describe('traverse', () => {
  const allNodes = ['1', '2', '3', '4', '5', '6']
  const graphs = [
    { name: 'Mocked Relations 1', graph: mockedRelations1 },
    { name: 'Mocked Relations 2', graph: mockedRelations2 },
    { name: 'Mocked Relations 3', graph: mockedRelations3 },
  ]

  const graphsWithCycles = [
    { name: 'Mocked Relations with Cycle', graph: mockedRelationsWithCycle },
    { name: 'Mocked Relations with Cycle No Root', graph: mockedRelationsWithCycleNoRoot },
  ]

  allNodes.forEach(node => {
    graphs.forEach(testCase => {
      it(`should traverse '${testCase.name}' both directions correctly from '${node}'`, () => {
        // @ts-ignore
        CardRelationManager.set(testCase.graph)
        const visited: string[] = []

        // @ts-ignore
        CardRelationManager.traverse(
          node,
          'both',
          id => !!visited.push(id),
          _ => {
            throw new Error('There should be no cycles')
          }
        )

        expect(new Set(visited)).toEqual(new Set(allNodes))
      })
    })
  })

  it('should stop traversal if forEach returns false', () => {
    // @ts-ignore
    CardRelationManager.set(mockedRelations1)
    const visited: string[] = []

    // @ts-ignore
    CardRelationManager.traverse('1', 'children', id => {
      visited.push(id)
      return id !== '3'
    })

    expect(visited).toEqual(['1', '2', '5', '3'])
  })

  graphsWithCycles.forEach(testCase => {
    it(`should detect cycles and call onCycle in '${testCase.name}'`, () => {
      try {
        // @ts-ignore
        CardRelationManager.set(testCase.graph)
      } catch (error) {
        expect(error).toBeInstanceOf(CycleError)
      }
      const visited: string[] = []
      const cycles: string[][] = []

      const spy = jest.fn()

      // @ts-ignore
      CardRelationManager.traverse(
        '1',
        'children',
        id => !!visited.push(id),
        _ => spy()
      )

      expect(spy).toHaveBeenCalled()
    })
  })
})
