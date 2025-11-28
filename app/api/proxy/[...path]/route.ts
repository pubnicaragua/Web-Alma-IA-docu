import { type NextRequest, NextResponse } from "next/server";

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

export async function handleProxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> } | { params: { path: string[] } }
) {
  try {
    const resolved = await context.params;
    const pathArray = resolved.path;
    const search = request.nextUrl.searchParams.toString();
    let apiUrl = getApiUrl(pathArray);

    if (search) apiUrl += `?${search}`;

    console.log("Proxy →", {
      method: request.method,
      path: pathArray.join("/"),
      target: apiUrl,
    });

    const hasBody =
      request.bodyUsed === false &&
      request.headers.has("content-length");

    const body = hasBody ? await request.blob() : null;

    const headers = new Headers();
    request.headers.forEach((v, k) => {
      if (k !== "host") headers.set(k, v);
    });

    const isLogin = pathArray.join("/") === "auth/login";

    if (!isLogin) {
      const auth = request.headers.get("authorization");
      if (!auth) {
        return NextResponse.json(
          { error: "Se requiere autenticación" },
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
      //headers: response.headers,
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
