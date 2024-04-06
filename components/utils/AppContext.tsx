import React, { createContext, ReactNode, useState, useMemo, useEffect } from 'react'
import { Pack } from '@/lib/PackManager'
import { Language, LanguageManager } from '@/lib/LanguageManager'
import { useQuery } from '@tanstack/react-query'

// Define types for the context values
// type LanguageContextType = {
//     language: Language;
//     setLanguage: (language: Language) => void;
// };

type PlaylistContextType = {
    playlist: Pack[]
    setPlaylist: (playlist: Pack[]) => void
}

type PlayerListContextType = {
    players: string[]
    setPlayers: (players: string[]) => void
}

// Default values for the contexts
// const defaultLanguage: LanguageContextType = {
//     language: LanguageManager.defaultLanguage,
//     setLanguage: () => {},
// };

const defaultPlaylist: PlaylistContextType = {
    playlist: [],
    setPlaylist: () => {},
}

const defaultPlayerList: PlayerListContextType = {
    players: [],
    setPlayers: () => {},
}

// Create contexts with default values
// export const LanguageContext = createContext<LanguageContextType>(defaultLanguage);
export const PlaylistContext = createContext<PlaylistContextType>(defaultPlaylist)
export const PlayerListContext = createContext<PlayerListContextType>(defaultPlayerList)

// AppContextProvider component
export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // const { data: supportedLanguages } = useQuery(LanguageManager.getFetchAllQuery());

    const [playlist, setPlaylist] = useState<Pack[]>([])
    const [players, setPlayers] = useState<string[]>([])
    // const [language, setLanguage] = useState<Language>();

    const playlistValue = useMemo(() => ({ playlist, setPlaylist }), [playlist])
    const playerListValue = useMemo(() => ({ players, setPlayers }), [players])
    // const languageValue = useMemo(() => ({ language, setLanguage }), [language]);

    useEffect(() => {
        // LanguageManager.setLanguage(LanguageManager.findDeviceLanguage(supportedLanguages as Language[]))
    }, [])

    return (
        // <LanguageContext.Provider value={languageValue}>
        <PlayerListContext.Provider value={playerListValue}>
            <PlaylistContext.Provider value={playlistValue}>{children}</PlaylistContext.Provider>
        </PlayerListContext.Provider>
        // </LanguageContext.Provider>
    )
}
