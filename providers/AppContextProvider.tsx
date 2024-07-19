import React, { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react'
import { Pack } from '@/managers/PackManager'
import { Category } from '@/managers/CategoryManager'
import { PlayedCard } from '@/managers/CardManager'
import { Player } from '@/models/Player'

type AppContextType = {
  playedCards: PlayedCard[]
  playedIds: Set<string>
  playlist: Set<Pack>
  players: Set<Player>
  categoryFilter: Set<string>
}

type AppContextAction = {
  type: 'togglePack' | 'togglePlayer' | 'addPlayCount' | 'toggleCategory' | 'addPlayedCard' | 'restartGame'
  payload?: any
}

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  if (set.has(value)) return new Set([...set].filter(v => v !== value))
  return new Set([...set, value])
}

function contextReducer(state: AppContextType, action: AppContextAction): AppContextType {
  const { type, payload } = action

  switch (type) {
    case 'togglePack': {
      return { ...state, playlist: toggleSet(state.playlist, payload) }
    }

    case 'togglePlayer': {
      return { ...state, players: toggleSet(state.players, payload) }
    }

    case 'addPlayCount': {
      for (const player of state.players) {
        if (player.name === payload) player.playCount++
      }
      return { ...state, players: new Set(state.players) }
    }

    case 'toggleCategory': {
      const category = payload as Category
      return { ...state, categoryFilter: toggleSet(state.categoryFilter, category.id) }
    }

    case 'addPlayedCard': {
      const playedCard = payload as PlayedCard
      return {
        ...state,
        playedCards: [...state.playedCards, playedCard],
        playedIds: new Set([...state.playedIds, playedCard.id]),
      }
    }

    case 'restartGame': {
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
