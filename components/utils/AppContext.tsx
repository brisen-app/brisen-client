import React, { createContext, ReactNode, useState, useMemo, useEffect } from 'react'
import { Pack } from '@/lib/PackManager'
import { Language, LanguageManager } from '@/lib/LanguageManager'
import { useQuery } from '@tanstack/react-query'
import { Category, CategoryManager } from '@/lib/CategoryManager'
import { Localization } from '@/lib/LocalizationManager'

type AppContext = {
    playlist: Set<Pack>
    players: Set<string>

    categories: Set<Category>
    locations: Set<Localization>
}

type AppContextType = {
    appContext: AppContext
    setAppContext: (context: AppContext) => void
}

const defaultAppContext: AppContextType = {
    appContext: {
        playlist: new Set(),
        players: new Set(),
        categories: new Set(),
        locations: new Set(),
    },
    setAppContext: () => {},
}

export const AppContext = createContext<AppContextType>(defaultAppContext)

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // const { data: supportedLanguages } = useQuery(LanguageManager.getFetchAllQuery());
    const { data: categories, isLoading, error } = useQuery(CategoryManager.getFetchAllQuery())

    const [appContext, setAppContext] = useState<AppContext>(defaultAppContext.appContext)
    // const [language, setLanguage] = useState<Language>();

    const appContextValue = useMemo(() => ({ appContext, setAppContext }), [appContext])

    return <AppContext.Provider value={appContextValue}>{children}</AppContext.Provider>
}
