import { type NextRequest, NextResponse } from "next/server";
import { decryptData } from "@/lib/crypto-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const getApiUrl = (path: string[]) => {
  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  return `${base}/${path.join("/")}`;
};

const handleApiError = (error: unknown, path: string) => {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return NextResponse.json(
      {
        error: "No se pudo conectar con el servidor API.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { error: "Error interno del servidor." },
    { status: 500 }
  );
};

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0].trim();
    if (ip) return ip;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  
  // Cast to any since 'ip' may not be present in the TypeScript definitions of NextRequest in this version
  const runtimeIp = (request as any).ip;
  if (runtimeIp) return runtimeIp;
  
  return "127.0.0.1";
};

async function handleProxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> } | { params: { path: string[] } }
) {
  try {
    const resolved = await context.params;
    const pathArray = resolved.path;
    const search = request.nextUrl.searchParams.toString();
    let apiUrl = getApiUrl(pathArray);

    if (search) apiUrl += `?${search}`;

    const pathJoined = pathArray.join("/");
    console.log("Proxy ->", {
      method: request.method,
      path: pathJoined,
      target: apiUrl,
    });

    const hasBody =
      request.bodyUsed === false &&
      request.headers.has("content-length");

    const headers = new Headers();
    request.headers.forEach((v, k) => {
      if (k !== "host") headers.set(k, v);
    });

    let body: BodyInit | null = null;
    const isAudit = pathJoined === "auditoria";

    if (request.method === "POST" && isAudit) {
      try {
        const json = await request.json();
        const clientIp = getClientIp(request);
        json.ip_origen = clientIp;
        body = JSON.stringify(json);
        headers.delete("content-length");
        headers.set("content-type", "application/json");
        
        console.log(`[PROXY-AUDIT] Intercepted audit request. Substituted ip_origen with client IP: ${clientIp}`);
      } catch (err) {
        console.error("Error reading/modifying audit request body:", err);
        body = hasBody ? await request.blob() : null;
      }
    } else {
      body = hasBody ? await request.blob() : null;
    }

    const isLogin = pathArray.join("/") === "auth/login";

    if (!isLogin) {
      // Intentar extraer y decodificar el token JWT real desde la cookie httpOnly
      const encryptedTokenCookie = request.cookies.get("auth_token")?.value;
      if (encryptedTokenCookie) {
        try {
          const realToken = decryptData(encryptedTokenCookie);
          headers.set("authorization", `Bearer ${realToken}`);
        } catch (e) {
          console.error("[PROXY] Error decrypting auth_token cookie:", e);
        }
      }

      const auth = headers.get("authorization");
      if (!auth) {
        return NextResponse.json(
          { error: "Se requiere autenticacion" },
          { status: 401 }
        );
      }
    }

    const response = await fetch(apiUrl, {
      method: request.method,
      headers,
      body,
    });

    console.log(`[PROXY] ${request.method} ${apiUrl} -> ${response.status}`);

    let data: any = {};
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
      data = JSON.stringify(data);
    } else {
      data = await response.text();
    }

    return new Response(data, {
      status: response.status,
      statusText: response.statusText,
    });

  } catch (error) {
    const resolved = await context.params;
    return handleApiError(error, resolved.path.join("/"));
  }
}

export async function GET(req: NextRequest, ctx: any) {
  return handleProxyRequest(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  return handleProxyRequest(req, ctx);
}

export async function PUT(req: NextRequest, ctx: any) {
  return handleProxyRequest(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: any) {
  return handleProxyRequest(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: any) {
  return handleProxyRequest(req, ctx);
}
