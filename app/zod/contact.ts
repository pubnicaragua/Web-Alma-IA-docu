import { z } from 'zod';

export const ContactUsSchema = z.object({
    name: z
        .string()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(50, { message: "El nombre no puede superar los 50 caracteres." }),
    email: z
        .string()
        .email({ message: "Ingresa un correo electrónico válido." }),
    phone: z
        .string()
        .regex(/^[0-9]{10}$/, {
            message: "El teléfono debe tener exactamente 10 dígitos.",
        }),
    captcha: z.literal(true, {
        errorMap: () => ({ message: "Debes confirmar que no eres un robot." }),
    }),
});