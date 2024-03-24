import React, { createContext, ReactNode, useState, useMemo, useEffect } from "react";
import { Pack } from "@/lib/PackManager";
import { Language, LanguageManager } from "@/lib/LanguageManager";
import { useQuery } from "@tanstack/react-query";

// Define types for the context values
// type LanguageContextType = {
//     language: Language;
//     setLanguage: (language: Language) => void;
// };

type PlaylistContextType = {
    playlist: Pack[];
    setPlaylist: (playlist: Pack[]) => void;
};

// Default values for the contexts
// const defaultLanguage: LanguageContextType = {
//     language: LanguageManager.defaultLanguage,
//     setLanguage: () => {},
// };

const defaultPlaylist: PlaylistContextType = {
    playlist: [],
    setPlaylist: () => {},
};

// Create contexts with default values
// export const LanguageContext = createContext<LanguageContextType>(defaultLanguage);
export const PlaylistContext = createContext<PlaylistContextType>(defaultPlaylist);

// AppContextProvider component
export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    // const { data: supportedLanguages } = useQuery(LanguageManager.getFetchAllQuery());

    const [playlist, setPlaylist] = useState<Pack[]>([]);
    // const [language, setLanguage] = useState<Language>();

    const playlistValue = useMemo(() => ({ playlist, setPlaylist }), [playlist]);
    // const languageValue = useMemo(() => ({ language, setLanguage }), [language]);

    useEffect(() => {
        // LanguageManager.setLanguage(LanguageManager.findDeviceLanguage(supportedLanguages as Language[]))
    }, []);

    return (
        // <LanguageContext.Provider value={languageValue}>
            <PlaylistContext.Provider value={playlistValue}>
                {children}
            </PlaylistContext.Provider>
        // </LanguageContext.Provider>
    );
};
