'use server'
import { ServerActionResponse } from "@/types/generics";
import { validateRecaptch } from "@/lib/reacaptcha";
import { ContactUsSchemaType } from "@/types/contact";

export async function ActionSendContact(values: ContactUsSchemaType): Promise<ServerActionResponse> {
    let message = '¡Tu mensaje ha sido enviado con éxito!';
    let status: 'success' | 'error' = 'success';
    let data = null;

    try {
        await validateRecaptch(values.captcha ?? '');
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/contacto/almaia`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            }
        );
        data = await response.json();
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
