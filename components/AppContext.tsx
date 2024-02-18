import React, { createContext, ReactNode, useState, useMemo } from 'react';
import { Pack } from '@/lib/supabase';

// Define types for the context values
type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
};

type PlaylistContextType = {
  playlist: Pack[];
  setPlaylist: (playlist: Pack[]) => void;
};

// Default values for the contexts
const defaultLanguage: LanguageContextType = {
  language: 'nb',
  setLanguage: () => {}
};

const defaultPlaylist: PlaylistContextType = {
  playlist: [],
  setPlaylist: () => {}
};

// Create contexts with default values
export const LanguageContext = createContext<LanguageContextType>(defaultLanguage);
export const PlaylistContext = createContext<PlaylistContextType>(defaultPlaylist);

// AppContextProvider component
export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [playlist, setPlaylist] = useState<Pack[]>([]);
  const [language, setLanguage] = useState<string>('nb');

  const playlistValue = useMemo(() => ({ playlist, setPlaylist }), [playlist]);
  const languageValue = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={languageValue}>
      <PlaylistContext.Provider value={playlistValue}>
        {children}
      </PlaylistContext.Provider>
    </LanguageContext.Provider>
  );
};
