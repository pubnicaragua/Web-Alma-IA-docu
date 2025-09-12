import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

export const AlertAddBinnacleSchema = z.object({
    planAccion: z.string().min(1, "El plan de acción es requerido"),
    fechaCompromiso: z.date({ required_error: "La fecha de compromiso es requerida" }),
    fechaRealizacion: z.date({ required_error: "La fecha de realización es requerida" }),
    archivo: z.instanceof(File).nullable().optional()
        .refine((file) => {
            if (!file) return true;
            return file.size <= MAX_FILE_SIZE;
        }, "El archivo no debe superar los 5MB.")
        .refine((file) => {
            if (!file) return true;
            return ACCEPTED_IMAGE_TYPES.includes(file.type);
        }, `Solo se permiten archivos ${ACCEPTED_IMAGE_TYPES.join(", ")}`),
    responsableName: z.string().min(1, "El responsable es requerido"),
    prioridad: z.string().min(1, "La prioridad es requerida"),
    severidad: z.string().min(1, "La severidad es requerida"),
    selectedEstado: z.string().min(1, "El estado es requerido"),
});


