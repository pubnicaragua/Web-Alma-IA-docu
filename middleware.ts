import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/contact",
  "/support",
  "/download",
  "/forgot-password",
  "/reset-password",
  "/reset-success",
];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );
}

function isTokenExpiredOrInvalid(encryptedToken: string): boolean {
  try {
    const token = decodeURIComponent(encryptedToken);
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    // atob decodifica base64 en entornos Web y Edge Runtime
    const payload = JSON.parse(atob(parts[1]));
    if (typeof payload.exp === "number") {
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    }
    return false;
  } catch (error) {
    return true;
  }
}

// Obtener la lista blanca de orígenes permitidos desde las variables de entorno
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin && origin !== "*");

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const origin = request.headers.get("origin");
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  // 1. Manejar preflight OPTIONS request para CORS
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (origin && isAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization, Date-Zone");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return response;
  }

  // 2. Si es una ruta de API, no aplicar redirecciones de sesión, solo inyectar cabeceras CORS
  if (path.startsWith("/api/")) {
    const response = NextResponse.next();
    if (origin && isAllowed) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization, Date-Zone");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
    return response;
  }

  // 3. Aplicar control de acceso para páginas del frontend
  const token = request.cookies.get("auth_token")?.value;
  const hasAuthCookie = token ? !isTokenExpiredOrInvalid(token) : false;

  let response: NextResponse;

  if (path === "/login" && hasAuthCookie) {
    response = NextResponse.redirect(new URL("/", request.url));
  } else if (!hasAuthCookie && !isPublicPath(path)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    response = NextResponse.redirect(loginUrl);
  } else {
    response = NextResponse.next();
  }

  // Inyectar cabeceras CORS si corresponde
  if (origin && isAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization, Date-Zone");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  // Coincidir con todas las rutas excepto recursos estáticos e imágenes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
