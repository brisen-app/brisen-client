import React, { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react'
import { Pack } from '@/managers/PackManager'
import { Category } from '@/managers/CategoryManager'
import { PlayedCard } from '@/managers/CardManager'
import { Player } from '@/models/Player'

type AppContextType = {
  categoryFilter: Set<string>
  playedCards: PlayedCard[]
  playedIds: Set<string>
  players: Set<Player>
  playlist: Set<Pack>
}

type AppContextAction =
  | { action: 'addPlayedCard'; payload: PlayedCard }
  | { action: 'restartGame'; payload?: never }
  | { action: 'toggleCategory'; payload: Category }
  | { action: 'togglePack'; payload: Pack }
  | { action: 'togglePlayer'; payload: Player }
  | { action: 'incrementPlayCounts'; payload: Set<Player> }

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  if (set.has(value)) return new Set([...set].filter(v => v !== value))
  return new Set([...set, value])
}

function contextReducer(state: AppContextType, action: AppContextAction): AppContextType {
  const { action: type, payload } = action

  switch (type) {
    case 'togglePack': {
      return { ...state, playlist: toggleSet(state.playlist, payload) }
    }

    case 'togglePlayer': {
      return { ...state, players: toggleSet(state.players, payload) }
    }

    case 'incrementPlayCounts': {
      const playersToUpdate = [...payload].map(player => player.name)
      const players = new Set<Player>()
      for (const player of state.players) {
        if (!playersToUpdate.includes(player.name)) {
          players.add(player)
          console.log(player)
        } else {
          players.add({ ...player, playCount: player.playCount + 1 })
          console.log({ ...player, playCount: player.playCount + 1 })
        }
      }
      return { ...state, players: players }
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

    case 'restartGame': {
      const players = new Set<Player>()
      for (const player of state.players) {
        players.add({ ...player, playCount: 0 })
      }
      return { ...state, playlist: new Set(), playedCards: [], playedIds: new Set() }
    }

    default: {
      throw new Error(`Unhandled action type: ${type}`)
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
