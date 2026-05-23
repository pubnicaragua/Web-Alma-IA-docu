import { type NextRequest, NextResponse } from "next/server";
import fs from "fs";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Función auxiliar para normalizar la URL
const getApiUrl = (path: string[]) => {
  const pathStr = path.join("/");
  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  return `${baseUrl}/${pathStr}`;
};

// Función para manejar errores de manera consistente
const handleApiError = (error: unknown, path: string) => {
  // Determinar el tipo de error para dar una respuesta más específica
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return NextResponse.json(
      {
        error:
          "No se pudo conectar con el servidor API. Por favor, inténtelo más tarde.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { error: "Error interno del servidor al procesar la solicitud." },
    { status: 500 }
  );
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params antes de usar sus propiedades
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    const apiUrl = getApiUrl(resolvedParams.path);

    // Obtener searchParams de la URL del request
    const { searchParams } = new URL(request.url);

    // Construir la URL final con query parameters
    let finalApiUrl = apiUrl;
    if (searchParams.size > 0) {
      const queryString = Array.from(searchParams.entries())
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
      finalApiUrl += `?${queryString}`;
    }

    // Obtener el token de autorización de la solicitud
    const authHeader = request.headers.get("authorization");

    // Preparar headers para la solicitud a la API externa
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Añadir el header de autorización si existe
    if (authHeader) {
      headers["Authorization"] = authHeader;
    } else {
      console.warn(
        "No se proporcionó token de autorización para la solicitud GET a:",
        path
      );

      // Si no hay token, rechazar la solicitud
      return NextResponse.json(
        { error: "Se requiere autenticación" },
        { status: 401 }
      );
    }

    // Hacer la solicitud a la API real
    const response = await fetch(finalApiUrl, {
      method: "GET",
      headers,
      // Añadir un timeout para evitar que la solicitud se quede colgada
      signal: AbortSignal.timeout(10000), // 10 segundos de timeout
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Intentar leer el cuerpo de la respuesta como texto
      const errorText = await response.text();

      // Devolver el error
      return NextResponse.json(
        { error: errorText || response.statusText || "Error en la solicitud" },
        { status: response.status }
      );
    }

    // Intentar parsear la respuesta como JSON
    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      // Si no es JSON, devolver el texto
      const textData = await response.text();
      return new NextResponse(textData, {
        status: response.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error) {
    const resolvedParams = await params;
    return handleApiError(error, resolvedParams.path.join("/"));
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    const apiUrl = getApiUrl(resolvedParams.path);

    // Determinar si la petición tiene cuerpo para evitar errores
    const hasBody = request.bodyUsed === false && request.headers.has("content-length");
    const body = hasBody ? await request.blob() : null;

    let bodyText = "";
    if (body) {
      bodyText = await body.text();
    }

    if (path.includes("alumnos/buscar")) {
      try {
        fs.appendFileSync(
          "c:\\Users\\jahir\\Web-Alma-IA-docu\\proxy-debug.log",
          `[${new Date().toISOString()}] POST Request to ${path}: ${bodyText}\n`
        );
      } catch (e) {}
    }

    // Copiar headers
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // El host del proxy no debe ser el mismo que el de la API de destino
      if (key.toLowerCase() !== "host") {
        headers.set(key, value);
      }
    });

    // Lógica de autenticación (sin cambios)
    const isLoginRequest = path === "auth/login";
    if (!isLoginRequest) {
      const authHeader = request.headers.get("authorization");
      if (!authHeader) {
        return NextResponse.json(
          { error: "Se requiere autenticación" },
          { status: 401 }
        );
      }
    }

    // Reenviar la petición usando el cuerpo leído (Blob)
    const response = await fetch(apiUrl, {
      method: request.method,
      headers,
      body: body ? new Blob([bodyText], { type: body.type }) : null, // Re-crear Blob para no consumir el original si ya se leyó
    });

    // Leer la respuesta para depuración si es de búsqueda
    let responseText = "";
    if (path.includes("alumnos/buscar")) {
      try {
        const clonedResponse = response.clone();
        responseText = await clonedResponse.text();
        fs.appendFileSync(
          "c:\\Users\\jahir\\Web-Alma-IA-docu\\proxy-debug.log",
          `[${new Date().toISOString()}] POST Response from ${path} (status ${response.status}): ${responseText.slice(0, 2000)}\n`
        );
      } catch (e) {
        try {
          fs.appendFileSync(
            "c:\\Users\\jahir\\Web-Alma-IA-docu\\proxy-debug.log",
            `[${new Date().toISOString()}] POST Response logging failed: ${e}\n`
          );
        } catch (inner) {}
      }
    }

    // Intentar parsear la respuesta como JSON para evitar problemas de streams y headers
    try {
      // Usar la respuesta clonada si la leímos antes, de lo contrario clonar ahora
      const finalResponse = path.includes("alumnos/buscar") ? response.clone() : response;
      const data = await finalResponse.json();
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      // Si no es JSON, usar el texto que ya leímos o leer de nuevo
      const textData = path.includes("alumnos/buscar") ? responseText : await response.text();
      return new NextResponse(textData, {
        status: response.status,
        headers: { "Content-Type": "text/plain" },
      });
    }

  } catch (error) {
    console.error("Error en el proxy:", error);
    try {
      fs.appendFileSync(
        "c:\\Users\\jahir\\Web-Alma-IA-docu\\proxy-debug.log",
        `[${new Date().toISOString()}] POST Exception: ${error}\n`
      );
    } catch (e) {}
    const resolvedParams = await params;
    return handleApiError(error, resolvedParams.path.join("/"));
  }
}

// Aplicar los mismos cambios para PUT y DELETE...
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    const body = await request.json().catch(() => ({}));
    const apiUrl = getApiUrl(resolvedParams.path);

    // Obtener el token de autorización de la solicitud
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    } else {
      console.warn(
        "No se proporcionó token de autorización para la solicitud PUT a:",
        path
      );

      // Si no hay token, rechazar la solicitud
      return NextResponse.json(
        { error: "Se requiere autenticación" },
        { status: 401 }
      );
    }

    // Hacer la solicitud a la API real
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Intentar leer el cuerpo de la respuesta como texto
      const errorText = await response.text();

      // Devolver un error formateado
      return NextResponse.json(
        { error: errorText || response.statusText || "Error en la solicitud" },
        { status: response.status }
      );
    }

    // Intentar parsear la respuesta como JSON
    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      // Si no es JSON, devolver el texto
      const textData = await response.text();
      return new NextResponse(textData, {
        status: response.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error) {
    const resolvedParams = await params;
    return handleApiError(error, resolvedParams.path.join("/"));
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    const apiUrl = getApiUrl(resolvedParams.path);

    // Obtener el token de autorización de la solicitud
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    } else {
      console.warn(
        "No se proporcionó token de autorización para la solicitud DELETE a:",
        path
      );

      // Si no hay token, rechazar la solicitud
      return NextResponse.json(
        { error: "Se requiere autenticación" },
        { status: 401 }
      );
    }

    // Hacer la solicitud a la API real
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers,
      signal: AbortSignal.timeout(10000),
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      // Intentar leer el cuerpo de la respuesta como texto
      const errorText = await response.text();

      // Devolver un error formateado
      return NextResponse.json(
        { error: errorText || response.statusText || "Error en la solicitud" },
        { status: response.status }
      );
    }

    // Intentar parsear la respuesta como JSON
    try {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (error) {
      // Si no es JSON, devolver el texto
      const textData = await response.text();
      return new NextResponse(textData, {
        status: response.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error) {
    const resolvedParams = await params;
    return handleApiError(error, resolvedParams.path.join("/"));
  }
}
