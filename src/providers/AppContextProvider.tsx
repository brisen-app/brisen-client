import React, { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react'
import { Pack } from '@/src/managers/PackManager'
import { Category } from '@/src/managers/CategoryManager'
import { PlayedCard } from '@/src/managers/CardManager'
import { Player } from '@/src/models/Player'

export type AppContextType = {
  categoryFilter: Set<string>
  playedCards: PlayedCard[]
  playedIds: Set<string>
  players: Set<Player>
  playlist: Set<Pack>
}

export type AppContextAction =
  | { action: 'addPlayedCard'; payload: PlayedCard }
  | { action: 'removeCachedPlayedCard'; payload: PlayedCard }
  | { action: 'restartGame'; payload?: never }
  | { action: 'toggleCategory'; payload: Category }
  | { action: 'togglePack'; payload: Pack }
  | { action: 'togglePlayer'; payload: Player }
  | { action: 'incrementPlayCounts'; payload: Set<Player> }

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  if (set.has(value)) return new Set([...set].filter(v => v !== value))
  return new Set([...set, value])
}

function incrementPlayCounts(players: Set<Player>, state: AppContextType, amount = 1): Set<Player> {
  const playersToUpdate = [...players].map(player => player.name)
  const updatedPlayers = new Set<Player>()
  for (const player of state.players) {
    if (!playersToUpdate.includes(player.name)) {
      updatedPlayers.add(player)
      console.log(player)
    } else {
      updatedPlayers.add({ ...player, playCount: player.playCount + amount })
      console.log({ ...player, playCount: player.playCount + amount })
    }
  }
  return updatedPlayers
}

export function contextReducer(state: AppContextType, action: AppContextAction): AppContextType {
  const { action: type, payload } = action

  switch (type) {
    case 'togglePack': {
      return { ...state, playlist: toggleSet(state.playlist, payload) }
    }

    case 'togglePlayer': {
      return { ...state, players: toggleSet(state.players, payload) }
    }

    case 'incrementPlayCounts': {
      return { ...state, players: incrementPlayCounts(payload, state) }
    }

    case 'toggleCategory': {
      return { ...state, categoryFilter: toggleSet(state.categoryFilter, payload.id) }
    }

    case 'addPlayedCard': {
      return {
        ...state,
        playedCards: [...state.playedCards, payload],
        playedIds: new Set([...state.playedIds, payload.id]),
      }
    }

    case 'removeCachedPlayedCard': {
      return {
        ...state,
        players: incrementPlayCounts(payload.featuredPlayers, state, -1),
        playedCards: state.playedCards.filter(card => card.id !== payload.id),
        playedIds: new Set([...state.playedIds].filter(id => id !== payload.id)),
      }
    }

    case 'restartGame': {
      const players = new Set<Player>()
      for (const player of state.players) {
        players.add({ ...player, playCount: 0 })
      }
      return { ...state, players: players, playlist: new Set(), playedCards: [], playedIds: new Set() }
    }

    default: {
      throw new Error(`Unhandled action type: '${type}'`)
    }
  }
}

const AppContext = createContext<AppContextType | null>(null)
const AppDispatchContext = createContext<Dispatch<AppContextAction> | null>(null)

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within an AppContextProvider')
  return context
}

export function useAppDispatchContext() {
  const context = useContext(AppDispatchContext)
  if (!context) throw new Error('AppDispatchContext must be used within an AppContextProvider')
  return context
}

export function AppContextProvider(props: Readonly<{ children: ReactNode }>) {
  const [context, setContext] = useReducer(contextReducer, {
    playedCards: [],
    playedIds: new Set(),
    playlist: new Set(),
    players: new Set(),
    categoryFilter: new Set(),
  } as AppContextType)

  return (
    <AppContext.Provider value={context}>
      <AppDispatchContext.Provider value={setContext}>{props.children}</AppDispatchContext.Provider>
    </AppContext.Provider>
  )
}
