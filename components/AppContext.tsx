import Pack from '@/types/Pack';
import { createContext, ReactNode, useState, useMemo, Dispatch } from 'react';


export const PlaylistContext = createContext({
    playlist: [] as Pack[],
    setPlaylist: (playlist: Pack[]) => {}
});

export function AppContextProvider(props: Readonly<{ children: ReactNode }>) {
    const { children } = props;
    const [playlist, setPlaylist] = useState([] as Pack[]);

    const value = useMemo(() => ({
        playlist,
        setPlaylist
    }), [playlist]);

    return (
        <PlaylistContext.Provider value={ value }>
            {children}
        </PlaylistContext.Provider>)
}
