// lib/api-config.ts
import { dispatchAuthChangeEvent } from "./auth-events";
import { decryptData, encryptData } from "./crypto-utils";
import { normalizeSelectedSchoolId } from "./school-id";

// API base URL para el proxy local
export const API_BASE_URL = "/api/proxy";

// Function to get the auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    const encryptedToken = localStorage.getItem("auth_token");
    if (encryptedToken) {
      return decryptData(encryptedToken);
    }
  }
  return null;
};

// Function to get the auth token from cookie
export const getAuthTokenFromCookie = (): string | null => {
  if (typeof window !== "undefined") {
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
    const authCookie = cookies.find((cookie) =>
      cookie.startsWith("auth_token=")
    );
    if (authCookie) {
      const encryptedToken = authCookie.split("=")[1];
      return decryptData(encryptedToken);
    }
    return null;
  }
  return null;
};

export const setAuthToken = (
  token: string,
  rememberMe: boolean = false
): void => {
  if (typeof window !== "undefined") {
    try {
      // Cifrar token antes de guardar en localStorage  
      const encryptedToken = encryptData(token);
      localStorage.setItem("auth_token", encryptedToken);

      // Para cookies, también cifrar  
      let cookieString = `auth_token=${encryptedToken}; path=/; SameSite=Lax`;
      if (rememberMe) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 15);
        cookieString += `; expires=${expirationDate.toUTCString()}`;
      }
      document.cookie = cookieString;

      dispatchAuthChangeEvent(true);
    } catch (error) {
      console.error('Error setting encrypted token:', error);
    }
  }
};

// Function to remove the auth token (for logout)
export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth_token");
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";

      dispatchAuthChangeEvent(false);
    } catch (error) { }
  }
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const cookieToken = getAuthTokenFromCookie();
  const isAuth = !!token || !!cookieToken;

  return isAuth;
};

// Custom error class for API errors
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Helper function to get selected school ID safely
const getSelectedSchoolId = (): string | null => {
  if (typeof window !== "undefined") {
    try {
      const selectedSchool = localStorage.getItem("selectedSchool");
      return normalizeSelectedSchoolId(selectedSchool);
    } catch (error) {
      return null;
    }
  }
  return null;
};

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {},
  addSchoolId: boolean = true // nuevo parámetro para controlar si se agrega colegio_id
): Promise<Response> => {
  const token = getAuthToken();
  const method = options.method || "GET";

  const headers = {
    "Content-Type": "application/json",
    "Date-Zone": JSON.stringify(
      Intl.DateTimeFormat(undefined, { timeZone: "UTC" }).resolvedOptions()
    ),
    "Access-Control-Request-Headers": "date-zone",

    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let processedEndpoint = endpoint;

  // Solo agregar colegio_id si addSchoolId es true y se cumplen las condiciones originales
  if (
    addSchoolId &&
    !endpoint.endsWith("/colegios") &&
    !endpoint.includes("/preguntas") &&
    !endpoint.includes("/colegios/usuarios_colegios")
  ) {
    const selectedSchool = getSelectedSchoolId();
    if (selectedSchool) {
      const separator = endpoint.includes("?") ? "&" : "?";
      processedEndpoint += `${separator}colegio_id=${selectedSchool}`;
    }
  }

  const normalizedEndpoint = processedEndpoint.startsWith("/")
    ? processedEndpoint
    : `/${processedEndpoint}`;

  try {
    const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
      ...options,
      method,
      headers,
    });

    if (response.status === 401) {
      throw new ApiError("Token inválido o expirado", 401);
    }

    if (!response.ok) {
      let errorDetails = `${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorDetails += ` - ${errorBody}`;
        }
      } catch (parseError) {
        console.warn("No se pudo leer el cuerpo del error:", parseError);
      }

      throw new ApiError(
        `Error en la solicitud: ${errorDetails}`,
        response.status
      );
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(`Error de red: ${error}`, 0);
  }
};

// Simple fetch without auth
export const fetchApi = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  const method = options.method || "GET";

  const headers = {
    "Content-Type": "application/json",
    "Date-Zone": JSON.stringify(Intl.DateTimeFormat().resolvedOptions()),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Asegurar que el endpoint comience con /
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  try {
    const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
      ...options,
      method,
      headers,
    });

    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Intentar leer el cuerpo de la respuesta para obtener más detalles
      let errorDetails = `${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorDetails += ` - ${errorBody}`;
        }
      } catch (parseError) {
        console.warn("No se pudo leer el cuerpo del error:", parseError);
      }

      throw new ApiError(
        `Error en la solicitud: ${errorDetails}`,
        response.status
      );
    }

    return response;
  } catch (error) {
    // Si es un ApiError, lo propagamos
    if (error instanceof ApiError) {
      throw error;
    }

    // Si es otro tipo de error, lo envolvemos en un ApiError
    throw new ApiError(`Error de red: ${error}`, 0);
  }
};
