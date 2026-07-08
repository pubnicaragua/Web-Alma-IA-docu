"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { ProfileResponse } from "@/services/profile-service";
import { useAuth } from "@/middleware/auth-provider";
import { getAuthToken, removeAuthToken } from "../lib/api-config";
import { cacheService } from "@/lib/cache-service";
import { useRouter } from "next/navigation";
import { createGetRequestDeduper } from "@/lib/get-request-dedupe";
import { normalizeSelectedSchoolId } from "@/lib/school-id";

const dedupeProfileGet = createGetRequestDeduper();

// Tipos
export interface UserContextState {
  userData: ProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: boolean;
  selectedSchoolId: string | null;
}

export interface UserContextActions {
  loadUserData: (forceRefresh?: boolean) => Promise<void>;
  clearUserData: () => void;
  isRefreshing: () => void;
  getFuntions: (busqueda: string) => boolean;
  updateUserData: (newData: ProfileResponse) => void;
  setSelectedSchoolId: (id: string | null) => void;
}

type UserContextType = UserContextState & UserContextActions;

// Valor inicial
const initialContextValue: UserContextType = {
  userData: null,
  isLoading: false,
  error: null,
  refresh: false,
  selectedSchoolId: null,
  isRefreshing: () => { },
  loadUserData: async () => { },
  clearUserData: () => { },
  getFuntions: () => false,
  updateUserData: () => { },
  setSelectedSchoolId: () => { },
};

export const UserContext = createContext<UserContextType>(initialContextValue);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [state, setState] = useState({
    userData: null as ProfileResponse | null,
    isLoading: false,
    error: null as string | null,
    refresh: false,
    selectedSchoolId: null as string | null,
  });

  const lastFetchTimeRef = useRef<number | null>(null);
  const isLoadingRef = useRef(false);

  // Cache duration 5 minutos (ms)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Inicializar selectedSchoolId desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const selected = normalizeSelectedSchoolId(localStorage.getItem("selectedSchool"));
      setState((prev) => ({ ...prev, selectedSchoolId: selected }));
    }
  }, []);

  // Setter que sincroniza estado y localStorage
  const setSelectedSchoolId = useCallback((id: string | null) => {
    const normalizedId = normalizeSelectedSchoolId(id);
    setState((prev) => ({ ...prev, selectedSchoolId: normalizedId }));
    if (typeof window !== "undefined") {
      if (normalizedId === null) localStorage.removeItem("selectedSchool");
      else localStorage.setItem("selectedSchool", normalizedId);
    }
  }, []);

  // Actualiza userData y cache
  const updateUserData = useCallback((newData: ProfileResponse) => {
    setState((prev) => ({ ...prev, userData: newData, error: null }));
    cacheService.set("user-profile", newData, 10 * 60 * 1000);
    lastFetchTimeRef.current = Date.now();
  }, []);

  const clearUserData = useCallback(() => {
    setState((prev) => ({ ...prev, userData: null, error: null }));
    lastFetchTimeRef.current = null;
  }, []);

  const clearInvalidSession = useCallback(async () => {
    clearUserData();
    cacheService.clear();
    await removeAuthToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
      sessionStorage.clear();
    }
    router.replace("/login");
  }, [clearUserData, router]);

  // Carga perfil usuario con cache y control de peticiones
  const loadUserData = useCallback(async (forceRefresh = false) => {
    try {
      const now = Date.now();

      if (forceRefresh) {
        cacheService.clear("user-profile");
        lastFetchTimeRef.current = null;
      }

      if (isLoadingRef.current && !forceRefresh) return;

      const cachedData = cacheService.get<ProfileResponse>("user-profile");
      const cacheValid =
        cachedData &&
        lastFetchTimeRef.current !== null &&
        now - lastFetchTimeRef.current < CACHE_DURATION;

      if (cacheValid && !forceRefresh) {
        setState((prev) => ({
          ...prev,
          userData: cachedData,
          error: null,
        }));
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setState((prev) => ({ ...prev, error: "No auth token available" }));
        return;
      }

      isLoadingRef.current = true;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const data = await dedupeProfileGet<ProfileResponse | null>(
        "/api/proxy/perfil/obtener",
        { params: { __authScope: token.slice(-12) } },
        async () => {
          const response = await fetch("/api/proxy/perfil/obtener", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorBody = await response.text();
            if (
              response.status === 401 ||
              errorBody.toLowerCase().includes("invalid token")
            ) {
              clearInvalidSession();
              return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return (await response.json()) as ProfileResponse;
        }
      );

      if (!data) return;

      setState((prev) => ({ ...prev, userData: data }));
      cacheService.set("user-profile", data, 10 * 60 * 1000);
      lastFetchTimeRef.current = now;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
      isLoadingRef.current = false;
    }
  }, [clearInvalidSession]);

  const getFuntions = useCallback(
    (busqueda: string): boolean => {
      if (!state.userData?.funcionalidades) return false;
      return state.userData.funcionalidades.some(
        (funcionalidad) =>
          typeof funcionalidad.nombre === "string" &&
          funcionalidad.nombre.trim().toLowerCase() ===
          busqueda.trim().toLowerCase()
      );
    },
    [state.userData]
  );

  const isRefreshing = useCallback(() => {
    setState((prev) => ({ ...prev, refresh: !prev.refresh }));
  }, []);

  useEffect(() => {
    if (isAuthenticated && !state.userData && !isLoadingRef.current) {
      loadUserData();
    }
    if (!isAuthenticated) {
      clearUserData();
    }
  }, [isAuthenticated, loadUserData, clearUserData, state.userData]);

  useEffect(() => {
    if (state.refresh && isAuthenticated) {
      loadUserData(true);
    }
  }, [state.refresh, isAuthenticated, loadUserData]);

  const contextValue = useMemo(
    () => ({
      userData: state.userData,
      isLoading: state.isLoading,
      error: state.error,
      refresh: state.refresh,
      selectedSchoolId: state.selectedSchoolId,
      loadUserData,
      clearUserData,
      getFuntions,
      isRefreshing,
      updateUserData,
      setSelectedSchoolId,
    }),
    [
      state.userData,
      state.isLoading,
      state.error,
      state.refresh,
      state.selectedSchoolId,
      loadUserData,
      clearUserData,
      getFuntions,
      isRefreshing,
      updateUserData,
      setSelectedSchoolId,
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}
