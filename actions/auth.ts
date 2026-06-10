'use server'
import { ServerActionResponse } from "@/types/generics";
import { AuthLoginSchemaType } from "@/types/auth";
import { ProfileResponse } from "@/services/profile-service";
import { validateRecaptch } from "@/lib/reacaptcha";

function getLoginErrorMessage(status: number, responseText: string) {
    const normalizedText = responseText.toLowerCase();

    if (
        status === 401 ||
        normalizedText.includes("invalid login credentials")
    ) {
        return "Correo o contraseña incorrectos.";
    }

    if (status === 429) {
        return "Demasiados intentos. Espera unos minutos e intenta nuevamente.";
    }

    if (status >= 500) {
        return "No pudimos iniciar sesión por un problema del servidor. Intenta nuevamente en unos minutos.";
    }

    return "No pudimos iniciar sesión. Revisa tus datos e intenta nuevamente.";
}

export async function ActionMakeLogin(values: AuthLoginSchemaType): Promise<ServerActionResponse> {
    let message = '¡Inicio sesión con exito!';
    let status: 'success' | 'error' = 'success';
    let data = null;

    try {
        // ToDo: Crear una instancia de axios del lado del servidor
        await validateRecaptch(values.captcha ?? '');
        data = await validateCredentials(values);
        await validateProfileType(data.token);
    } catch (error) {
        if (error instanceof Error) {
            message = error.message;
        } else {
            message = 'Ocurrió un error inesperado';
        }
        status = 'error';
    }

    return { message, status, data };
}

// Validar Credenciales con el servidor
async function validateCredentials(values: AuthLoginSchemaType) {
    const loginUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`

    console.log('[AUTH] ========== INICIO LOGIN ==========');
    console.log('[AUTH] URL:', loginUrl);
    console.log('[AUTH] Email:', values.email);

    try {
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                identifier: values.email,
                password: values.password,
            }),
        });

        console.log('[AUTH] Status HTTP:', response.status);
        console.log('[AUTH] Status Text:', response.statusText);

        const responseText = await response.text();
        console.log('[AUTH] Response Body:', responseText);

        if (!response.ok) {
            console.error('[AUTH] ❌ ERROR - Login fallido');
            console.error('[AUTH] Status:', response.status);
            console.error('[AUTH] Body:', responseText);
            throw new Error(getLoginErrorMessage(response.status, responseText || response.statusText));
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('[AUTH] ❌ ERROR - No se pudo parsear JSON:', responseText);
            throw new Error("Respuesta inválida del servidor");
        }

        console.log('[AUTH] ✅ Login exitoso');
        console.log('[AUTH] Token recibido:', !!data.token);
        console.log('[AUTH] Datos:', { token: !!data.token, user: data.user ? 'presente' : 'ausente' });

        if (!data.token) {
            console.error('[AUTH] ❌ ERROR - No hay token en la respuesta');
            throw new Error("No se recibió un token válido");
        }

        console.log('[AUTH] ========== FIN LOGIN EXITOSO ==========');
        return data;
    } catch (error) {
        console.error('[AUTH] ========== ERROR EN LOGIN ==========');
        console.error('[AUTH] Error:', error);
        throw error;
    }
}

// Validar tipo de Perfil
async function validateProfileType(token: string) {
    const profileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/perfil/obtener`;
    const response = await fetch(profileUrl, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Date-Zone": JSON.stringify(
                Intl.DateTimeFormat(undefined, { timeZone: "UTC" }).resolvedOptions()
            ),
            "Access-Control-Request-Headers": "date-zone",
            "Authorization": `Bearer ${token}`
        },
    });

    const data = await response.json() as ProfileResponse;

    if (!data) {
        throw new Error("No se pudo obtener el perfil");
    }

    if (["Alumno", "Apoderado"].includes(data.rol.nombre)) {
        throw new Error("No tienes permiso para acceder a esta sección.");
    }

    return data;
}


