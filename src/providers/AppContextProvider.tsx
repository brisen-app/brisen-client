import { PlayedCard } from '@/src/managers/CardManager'
import { Category } from '@/src/managers/CategoryManager'
import { Player } from '@/src/models/Player'
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, Dispatch, ReactNode, useContext, useEffect, useReducer } from 'react'
import { AppState } from 'react-native'
import { Serializable } from '../lib/utils'

export const APP_CONTEXT_KEY = 'context'

export type AppContextType = {
  categoryFilter: string[]
  playedCards: PlayedCard[]
  currentCard?: string
  playedIds: Set<string>
  players: Set<Player>
  playlist: string[]
}

export type AppContextAction =
  | { action: 'setContext'; payload: AppContextType }
  | { action: 'addPlayedCard'; payload: PlayedCard }
  | { action: 'removeCachedPlayedCard'; payload: PlayedCard }
  | { action: 'restartGame'; payload?: never }
  | { action: 'toggleCategory'; payload: Category }
  | { action: 'togglePack'; payload: string }
  | { action: 'togglePlayer'; payload: Player }
  | { action: 'incrementPlayCounts'; payload: Player[] }
  | { action: 'currentCard'; payload?: string }
  | { action: 'storeState'; payload?: never }

export function initialContext(): AppContextType {
  return {
    categoryFilter: [],
    playedCards: [],
    playedIds: new Set(),
    players: new Set(),
    playlist: [],
  }
}

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  if (set.has(value)) return new Set([...set].filter(v => v !== value))
  return new Set([...set, value])
}

function toggleList<T>(list: T[], value: T): T[] {
  if (list.includes(value)) return list.filter(v => v !== value)
  return [...list, value]
}

function incrementPlayCounts(players: Player[], state: AppContextType, amount = 1): Set<Player> {
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
    case 'togglePack':
      return { ...state, playlist: toggleList(state.playlist, payload) }

    case 'togglePlayer':
      return { ...state, players: toggleSet(state.players, payload) }

    case 'incrementPlayCounts':
      return { ...state, players: incrementPlayCounts(payload, state) }

    case 'toggleCategory':
      return { ...state, categoryFilter: toggleList(state.categoryFilter, payload.id) }

    case 'addPlayedCard':
      return {
        ...state,
        playedCards: [...state.playedCards, payload],
        playedIds: new Set([...state.playedIds, payload.id]),
      }

    case 'removeCachedPlayedCard':
      return {
        ...state,
        players: incrementPlayCounts(payload.featuredPlayers, state, -1),
        playedCards: state.playedCards.filter(card => card.id !== payload.id),
        playedIds: new Set([...state.playedIds].filter(id => id !== payload.id)),
      }

    case 'restartGame': {
      const players = new Set<Player>()
      for (const player of state.players) {
        players.add({ ...player, playCount: 0 })
      }
      return { ...state, players: players, playlist: [], playedCards: [], playedIds: new Set() }
    }

    case 'currentCard':
      return { ...state, currentCard: payload }

    case 'setContext':
      return payload

    case 'storeState': {
      saveContext(state)
      return state
    }

    default:
      throw new Error(`Unhandled action type: '${type}'`)
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

export async function loadContext(): Promise<AppContextType | undefined> {
  try {
    const context = await AsyncStorage.getItem(APP_CONTEXT_KEY)
    if (!context) {
      console.log('No context found in AsyncStorage')
      return
    }
    const parsedContext: Serializable<AppContextType> = JSON.parse(context)
    console.log('Loaded context from AsyncStorage')
    return {
      ...parsedContext,
      playedIds: new Set(parsedContext.playedIds),
      players: new Set(parsedContext.players),
    }
  } catch (error) {
    console.error('Failed to load context from AsyncStorage', error)
    return
  }
}

async function saveContext(context: AppContextType) {
  try {
    const parsedContext = JSON.stringify({
      ...context,
      playedIds: Array.from(context.playedIds),
      players: Array.from(context.players),
    } satisfies Serializable<AppContextType>)

    await AsyncStorage.setItem(APP_CONTEXT_KEY, parsedContext)
    console.log('Stored context in AsyncStorage')
  } catch (error) {
    console.error('Failed to store context in AsyncStorage', error)
  }
}

export function AppContextProvider(props: Readonly<{ children: ReactNode }>) {
  const [context, setContext] = useReducer(contextReducer, initialContext())

  useEffect(() => {
    // Load context from AsyncStorage before rendering the app
    loadContext().then(context => {
      if (context) setContext({ action: 'setContext', payload: context })
    })

    const stateListener = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') setContext({ action: 'storeState' })
    })

    return () => stateListener.remove()
  }, [])

  return (
    <AppContext.Provider value={context}>
      <AppDispatchContext.Provider value={setContext}>{props.children}</AppDispatchContext.Provider>
    </AppContext.Provider>
  )
}
