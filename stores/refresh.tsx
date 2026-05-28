import { createContext, useState, ReactNode, useCallback, useMemo } from "react";

interface RefreshContextType {
    refresh: boolean;
    toggleRefresh: () => void;
}

export const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const RefreshProvider = ({ children }: { children: ReactNode }) => {
    const [refresh, setRefresh] = useState(false);

    const toggleRefresh = useCallback(() => {
        setRefresh(prev => !prev);
    }, []);

    const value = useMemo(() => ({ refresh, toggleRefresh }), [refresh, toggleRefresh]);

    return (
        <RefreshContext.Provider value={value}>
            {children}
        </RefreshContext.Provider>
    );
};