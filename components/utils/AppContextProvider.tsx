import React, { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react'
import { Pack } from '@/lib/PackManager'
import { Category } from '@/lib/CategoryManager'
import { PlayedCard } from '@/lib/CardManager'

type AppContextType = {
    playedCards: PlayedCard[]
    playlist: Set<Pack>
    players: Set<string>
    categoryFilter: Set<Category>
}

type AppContextAction = {
    type: 'togglePack' | 'addPlayer' | 'removePlayer' | 'toggleCategory' | 'addPlayedCard' | 'restartGame'
    payload?: any
}

function contextReducer(state: AppContextType, action: AppContextAction): AppContextType {
    const { type, payload } = action

    switch (type) {
        case 'togglePack':
            if (state.playlist.has(payload))
                return { ...state, playlist: new Set([...state.playlist].filter((p) => p !== payload)) }
            return { ...state, playlist: new Set([...state.playlist, payload]) }
        case 'addPlayer':
            return { ...state, players: new Set([...state.players, payload]) }
        case 'removePlayer':
            return { ...state, players: new Set([...state.players].filter((p) => p !== payload)) }
        case 'toggleCategory':
            if (state.categoryFilter.has(payload))
                return { ...state, categoryFilter: new Set([...state.categoryFilter].filter((c) => c !== payload)) }
            return { ...state, categoryFilter: new Set([...state.categoryFilter, payload]) }
        case 'addPlayedCard':
            return { ...state, playedCards: [...state.playedCards, payload] }
        case 'restartGame':
            return { ...state, playlist: new Set(), playedCards: [] }
        default:
            throw new Error(`Unhandled action type: ${type}`)
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
