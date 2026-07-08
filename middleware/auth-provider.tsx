"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { isAuthenticated, removeAuthToken } from "@/lib/api-config";
import { subscribeToAuthChanges } from "@/lib/auth-events";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cacheService } from "@/lib/cache-service";

type AuthContextType = {
  isAuthenticated: boolean;
  logout: (isForTime?: boolean) => Promise<void>;
  checkAuth: () => boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  logout: async () => {},
  checkAuth: () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const initialCheckDone = useRef(false);

  const checkAuth = () => {
    // Evitar verificaciones innecesarias
    if (initialCheckDone.current) {
      return isAuth;
    }

    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    initialCheckDone.current = true;
    return authStatus;
  };

  useEffect(() => {
    // Verificar autenticación inicial solo una vez
    if (!initialCheckDone.current) {
      checkAuth();
    }

    // Suscribirse a cambios de autenticación
    const unsubscribe = subscribeToAuthChanges((newAuthStatus) => {
      setIsAuth(newAuthStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const logout = async (isForTime = false) => {
    localStorage.clear();
    sessionStorage.clear();
    await removeAuthToken();
    setIsAuth(false);
    cacheService.clear();
    window.location.href = "/login";
    toast({
      title: "Sesión cerrada",
      description: isForTime
        ? "Tu sesión ha expirado por inactividad"
        : "Has cerrado sesión correctamente",
      variant: "default",
    });
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: isAuth, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}
