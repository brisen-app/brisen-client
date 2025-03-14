import { PlayedCard } from '@/src/managers/CardManager'
import { Category } from '@/src/managers/CategoryManager'
import { Pack } from '@/src/managers/PackManager'
import { Player } from '@/src/models/Player'
import { AppContextAction, AppContextType, contextReducer, initialContext } from '@/src/providers/AppContextProvider'

jest.mock('@/src/managers/LocalizationManager', () => ({
  LocalizationManager: {
    get: (key: string) => key,
  },
}))

// Mock Data
const mockPack = { id: 'pack1' } as Pack
const mockCategory = { id: 'category1' } as Category
const mockPlayedCard1 = { id: 'card1' } as PlayedCard
const mockPlayedCard2 = { id: 'card2' } as PlayedCard
const mockPlayer1 = { name: 'Player 1', playCount: 0 } as Player
const mockPlayer2 = { name: 'Player 2', playCount: 0 } as Player

describe('contextReducer', () => {
  it('should toggle pack', () => {
    let state = initialContext()
    const action = { action: 'togglePack', payload: mockPack.id } satisfies AppContextAction

    state = contextReducer(state, action)
    expect(state.playlist.includes(mockPack.id)).toBe(true)

    state = contextReducer(state, action)
    expect(state.playlist.includes(mockPack.id)).toBe(false)
  })

  it('should add player', () => {
    let state = initialContext()
    const action = { action: 'addPlayer', payload: mockPlayer1.name } satisfies AppContextAction

    state = contextReducer(state, action)
    expect(state.players.some(p => p.name == mockPlayer1.name)).toBeTruthy()
  })

  it('should not add existing player', () => {
    let state = { ...initialContext(), players: [mockPlayer1] }
    const action = { action: 'addPlayer', payload: mockPlayer1.name } satisfies AppContextAction

    state = contextReducer(state, action)
    expect(
      state.players
        .values()
        .filter(p => p.name == mockPlayer1.name)
        .toArray().length
    ).toBe(1)
  })

  it('should clear players', () => {
    let state = { ...initialContext(), players: [mockPlayer1, mockPlayer2] }
    const action = { action: 'clearPlayers' } satisfies AppContextAction

    state = contextReducer(state, action)
    expect(state.players.length).toBe(0)
  })

  it('should increment play counts', () => {
    let state = { ...initialContext(), players: [mockPlayer1, mockPlayer2] }
    const action = { action: 'incrementPlayCounts', payload: [mockPlayer1] } satisfies AppContextAction

    state = contextReducer(state, action)
    expect([...state.players][0].playCount).toBe(1)

    state = contextReducer(state, action)
    expect([...state.players][0].playCount).toBe(2)
    expect([...state.players][1].playCount).toBe(0)
  })

  it('should toggle category', () => {
    let state = { ...initialContext(), categoryFilter: new Array<string>() }
    const action = { action: 'toggleCategory', payload: mockCategory } satisfies AppContextAction

    state = contextReducer(state, action)
    expect(state.categoryFilter.includes(mockCategory.id)).toBe(true)

    state = contextReducer(state, action)
    expect(state.categoryFilter.includes(mockCategory.id)).toBe(false)
  })

  it('should add played card', () => {
    let state = initialContext()

    const action1 = { action: 'addPlayedCard', payload: mockPlayedCard1 } satisfies AppContextAction
    state = contextReducer(state, action1)
    expect(state.playedCards).toEqual([mockPlayedCard1])

    const action2 = { action: 'addPlayedCard', payload: mockPlayedCard2 } satisfies AppContextAction
    state = contextReducer(state, action2)
    expect(state.playedCards).toEqual([mockPlayedCard1, mockPlayedCard2])
  })

  it('should restart game', () => {
    let state: AppContextType = {
      ...initialContext(),
      categoryFilter: [mockCategory.id],
      playedCards: [mockPlayedCard1, mockPlayedCard2],
      playedIds: new Set<string>([mockPlayedCard1.id, mockPlayedCard2.id]),
      players: [
        { ...mockPlayer1, playCount: 1 },
        { ...mockPlayer2, playCount: 2 },
      ],
      playlist: [mockPack.id],
    }
    state.playedCards = [mockPlayedCard1, mockPlayedCard2]

    const action = { action: 'restartGame' } satisfies AppContextAction

    state = contextReducer(state, action)
    expect(state).toStrictEqual({
      ...initialContext(),
      categoryFilter: [mockCategory.id],
      playedCards: [],
      playedIds: new Set(),
      players: [
        { ...mockPlayer1, playCount: 0 },
        { ...mockPlayer2, playCount: 0 },
      ],
      playlist: [],
    } satisfies AppContextType)
  })

  it('should throw if action type is not recognized', () => {
    // @ts-ignore
    const action = { action: 'unknown' } as AppContextAction
    expect(() => contextReducer(initialContext(), action)).toThrow("Unhandled action type: 'unknown'")
  })
})
