import React, { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react'
import { Pack } from '@/lib/PackManager'

type AppContextType = {
    playlist: Set<Pack>
    players: Set<string>
}

type AppContextAction = {
    type: 'addPack' | 'removePack' | 'setPlaylist' | 'addPlayer' | 'removePlayer' | 'setPlayers'
    payload: any
}

function contextReducer(state: AppContextType, action: AppContextAction): AppContextType {
    const { type, payload } = action

    switch (type) {
        case 'addPack':
            return { ...state, playlist: new Set([...state.playlist, payload]) }
        case 'removePack':
            return { ...state, playlist: new Set([...state.playlist].filter((p) => p !== payload)) }
        case 'setPlaylist':
            return { ...state, playlist: payload }
        case 'addPlayer':
            return { ...state, players: new Set([...state.players, payload]) }
        case 'removePlayer':
            return { ...state, players: new Set([...state.players].filter((p) => p !== payload)) }
        case 'setPlayers':
            return { ...state, players: payload }
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
        playlist: new Set(),
        players: new Set(),
    } as AppContextType)

    return (
        <AppContext.Provider value={context}>
            <AppDispatchContext.Provider value={setContext}>{props.children}</AppDispatchContext.Provider>
        </AppContext.Provider>
    )
}
