import Language from '@/types/Language';
import Pack from '@/types/Pack';
import { createContext, ReactNode, useState, useMemo } from 'react';

export const languageContext = createContext({
    language: Language.defaultLanguage as Language,
    setLanguage: (language: Language) => {}
});

export const PlaylistContext = createContext({
    playlist: [] as Pack[],
    setPlaylist: (playlist: Pack[]) => {}
});

export function AppContextProvider(props: Readonly<{ children: ReactNode }>) {
    const { children } = props;
    const [playlist, setPlaylist] = useState([] as Pack[]);
    const [language, setLanguage] = useState(Language.defaultLanguage as Language);

    const playlistValue = useMemo(() => ({
        playlist,
        setPlaylist
    }), [playlist]);

    const languageValue = useMemo(() => ({
        language,
        setLanguage
    }), [language]);

    return (
        <languageContext.Provider value={ languageValue }>
            <PlaylistContext.Provider value={ playlistValue }>
                {children}
            </PlaylistContext.Provider>
        </languageContext.Provider>
    )
}
