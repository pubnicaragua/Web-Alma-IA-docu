'use server'
import { ServerActionResponse } from "@/types/generics";
import { AuthLoginSchemaType } from "@/types/auth";
import { ProfileResponse } from "@/services/profile-service";
import { validateRecaptch } from "@/lib/reacaptcha";

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

    if (!response.ok) {
        throw new Error("Las credenciales ingresadas no son válidas. Por favor, verifica tu correo y contraseña.");
    }

    const data = await response.json();

    if (!data.token) {
        throw new Error("No se recibió un token válido");
    }

    return data;
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


