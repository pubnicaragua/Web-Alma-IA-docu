'use server'
import { ServerActionResponse } from "@/types/generics";
import { AuthLoginSchemaType } from "@/types/auth";

export async function ActionMakeLogin(values: AuthLoginSchemaType): Promise<ServerActionResponse> {
    let message = '¡Inicio sesión con exito!';
    let status: 'success' | 'error' = 'success';
    let data = null;

    try {
        // Validar que se incluya el captcha
        if (!values?.captcha) {
            throw new Error('Por favor, marca la casilla "No soy un robot".');
        }

        // Validar el captcha
        const captchaRequest = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                secret: process.env.NEXT_PUBLIC_RECAPTCHA_SECRET ?? "",
                response: values.captcha ?? "",
            }),
        });

        const captchaData = await captchaRequest.json();
        if (!captchaData.success) {
            throw new Error("El ReCaptcha expiró, vuelva a intentarlo.");
        }

        // Validar las credenciales
        // ToDo: Crear una instancia de axios
        const loginUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`

        const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: values.email,
                password: values.password,
            }),
        });

        if (!response.ok) {
            throw new Error("Las credenciales ingresadas no son válidas. Por favor, verifica tu correo y contraseña.");
        }

        data = await response.json();

        if (!data.token) {
            throw new Error("No se recibió un token válido");
        }

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
