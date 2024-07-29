import { Pack } from '@/managers/PackManager'
import { Category } from '@/managers/CategoryManager'
import { PlayedCard } from '@/managers/CardManager'
import { Player } from '@/models/Player'
import { AppContextAction, AppContextType, contextReducer } from '@/providers/AppContextProvider'

const emptyState = {
  categoryFilter: new Set<string>(),
  playedCards: [],
  playedIds: new Set<string>(),
  players: new Set<Player>(),
  playlist: new Set<Pack>(),
} as AppContextType

// Mock Data
const mockPack = { id: 'pack1' } as Pack
const mockCategory = { id: 'category1' } as Category
const mockPlayedCard1 = { id: 'card1' } as PlayedCard
const mockPlayedCard2 = { id: 'card2' } as PlayedCard
const mockPlayer1 = { name: 'Player 1', playCount: 0 } as Player
const mockPlayer2 = { name: 'Player 2', playCount: 0 } as Player

describe('contextReducer', () => {
  it('should toggle pack', () => {
    let state = emptyState
    const action = { action: 'togglePack', payload: mockPack } as AppContextAction

    state = contextReducer(state, action)
    expect(state.playlist.has(mockPack)).toBe(true)

    state = contextReducer(state, action)
    expect(state.playlist.has(mockPack)).toBe(false)
  })

  it('should toggle player', () => {
    let state = emptyState
    const action = { action: 'togglePlayer', payload: mockPlayer1 } as AppContextAction

    state = contextReducer(state, action)
    expect(state.players.has(mockPlayer1)).toBe(true)

    state = contextReducer(state, action)
    expect(state.players.has(mockPlayer1)).toBe(false)
  })

  it('should increment play counts', () => {
    let state = { players: new Set<Player>([mockPlayer1, mockPlayer2]) } as AppContextType
    const action = { action: 'incrementPlayCounts', payload: new Set<Player>([mockPlayer1]) } as AppContextAction

    state = contextReducer(state, action)
    expect([...state.players][0].playCount).toBe(1)

    state = contextReducer(state, action)
    expect([...state.players][0].playCount).toBe(2)
    expect([...state.players][1].playCount).toBe(0)
  })

  it('should toggle category', () => {
    let state = { categoryFilter: new Set<string>() } as AppContextType
    const action = { action: 'toggleCategory', payload: mockCategory } as AppContextAction

    state = contextReducer(state, action)
    expect(state.categoryFilter.has(mockCategory.id)).toBe(true)

    state = contextReducer(state, action)
    expect(state.categoryFilter.has(mockCategory.id)).toBe(false)
  })

  it('should add played card', () => {
    let state = emptyState

    const action1 = { action: 'addPlayedCard', payload: mockPlayedCard1 } as AppContextAction
    state = contextReducer(state, action1)
    expect(state.playedCards).toEqual([mockPlayedCard1])

    const action2 = { action: 'addPlayedCard', payload: mockPlayedCard2 } as AppContextAction
    state = contextReducer(state, action2)
    expect(state.playedCards).toEqual([mockPlayedCard1, mockPlayedCard2])
  })

  it('should restart game', () => {
    let state = {
      categoryFilter: new Set<string>([mockCategory.id]),
      playedCards: [mockPlayedCard1, mockPlayedCard2],
      playedIds: new Set<string>([mockPlayedCard1.id, mockPlayedCard2.id]),
      players: new Set<Player>([
        { ...mockPlayer1, playCount: 1 },
        { ...mockPlayer2, playCount: 2 },
      ]),
      playlist: new Set<Pack>([mockPack]),
    } as AppContextType
    state.playedCards = [mockPlayedCard1, mockPlayedCard2]

    const action = { action: 'restartGame' } as AppContextAction
    state = contextReducer(state, action)
    expect(state).toStrictEqual({
      categoryFilter: new Set<string>([mockCategory.id]),
      playedCards: [],
      playedIds: new Set(),
      players: new Set<Player>([
        { ...mockPlayer1, playCount: 0 },
        { ...mockPlayer2, playCount: 0 },
      ]),
      playlist: new Set(),
    })
  })

  it('should throw if action type is not recognized', () => {
    // @ts-ignore
    const action = { action: 'unknown' } as AppContextAction
    expect(() => contextReducer(emptyState, action)).toThrow("Unhandled action type: 'unknown'")
  })
})
