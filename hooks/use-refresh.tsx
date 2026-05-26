import { RefreshContext } from "@/stores/refresh";
import { useContext } from "react";

export const useRefresh = () => {
    const context = useContext(RefreshContext);
    if (!context) {
        throw new Error("useRefresh debe usarse dentro de un RefreshProvider");
    }
    return context;
};