// hooks/use-session-timeout.ts
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { removeAuthToken } from "@/lib/api-config";
import { useAuth } from "@/middleware/auth-provider";

const WARNING_AFTER = 2.5 * 60 * 1000; // 2 minutos 30 segundos en milisegundos
const LOGOUT_AFTER_WARNING = 30 * 1000; // 30 segundos en milisegundos

export function useSessionTimeout() {
  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useAuth();
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDevelopment =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENVIROMENT === "development";

  const handleLogout = useCallback(() => {
    if (typeof window !== "undefined") logout(true);
  }, [router, toast]);

  const resetTimeout = useCallback(() => {
    if (typeof window !== "undefined") {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);

      // Configurar advertencia a los 2 minutos
      warningTimeoutRef.current = setTimeout(() => {
        toast({
          title: "Sesión por expirar",
          description:
            "Tu sesión expirará en 30 segundos. Realiza alguna acción para continuar.",
          variant: "destructive",
        });

        // Configurar logout 20 segundos DESPUÉS del warning
        logoutTimeoutRef.current = setTimeout(
          handleLogout,
          LOGOUT_AFTER_WARNING
        );
      }, WARNING_AFTER);
    }
  }, [handleLogout, toast]);

  useEffect(() => {
    if (isDevelopment) return;

    if (typeof window !== "undefined") {
      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
        "click",
      ];

      const resetOnActivity = () => resetTimeout();

      events.forEach((event) => {
        document.addEventListener(event, resetOnActivity, true);
      });

      resetTimeout(); // Iniciar temporizadores

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, resetOnActivity, true);
        });
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
      };
    }
  }, [isDevelopment, resetTimeout]);
}
