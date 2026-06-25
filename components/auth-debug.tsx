"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../middleware/auth-provider";
import { isAuthenticated, getAuthToken } from "@/lib/api-config";
import { subscribeToAuthChanges } from "@/lib/auth-events";

export function AuthDebug() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const { isAuthenticated: contextAuth, checkAuth } = useAuth();
  const [directAuth, setDirectAuth] = useState(isAuthenticated());
  const [token, setToken] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Actualizar el estado inicial
    setDirectAuth(isAuthenticated());
    setToken(getAuthToken());

    // Suscribirse a cambios de autenticación
    const unsubscribe = subscribeToAuthChanges(() => {
      setDirectAuth(isAuthenticated());
      setToken(getAuthToken());
      setLastUpdate(new Date());
    });

    // Actualizar cada segundo para mostrar cambios
    const interval = setInterval(() => {
      setDirectAuth(isAuthenticated());
      setToken(getAuthToken());
      setLastUpdate(new Date());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const forceCheck = () => {
    const result = checkAuth();
    setDirectAuth(isAuthenticated());
    setToken(getAuthToken());
    setLastUpdate(new Date());
    return result;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 text-xs">
      <h3 className="font-bold mb-2">Estado de Autenticación</h3>
      <div className="space-y-1">
        <p>
          <span className="font-semibold">Context Auth:</span>{" "}
          <span className={contextAuth ? "text-green-600" : "text-red-600"}>
            {contextAuth ? "Autenticado" : "No autenticado"}
          </span>
        </p>
        <p>
          <span className="font-semibold">Direct Auth:</span>{" "}
          <span className={directAuth ? "text-green-600" : "text-red-600"}>
            {directAuth ? "Autenticado" : "No autenticado"}
          </span>
        </p>
        <p>
          <span className="font-semibold">Token:</span>{" "}
          {token ? (
            <span className="text-green-600">{token.substring(0, 10)}...</span>
          ) : (
            <span className="text-red-600">No hay token</span>
          )}
        </p>
        <p>
          <span className="font-semibold">Última actualización:</span>{" "}
          {lastUpdate.toLocaleTimeString()}
        </p>
      </div>
      <button
        onClick={forceCheck}
        className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
      >
        Forzar verificación
      </button>
    </div>
  );
}
