import { z } from "zod"
import { SURVEY_FREQUENCIES, SURVEY_STATES } from "@/constants/surveys"

const SurveyQuestionSchema = z.object({
    titulo: z.string().nonempty("La pregunta es requerida"),
    tipo_id: z.number().min(1, { message: "El tipo de pregunta es requerido" }),
    posibles_respuestas: z.array(z.object({
        titulo: z.string().nonempty("La titulos de las respuestas requerido"),
        tono: z.number().min(0, { message: "El tono de la respuesta es requerido" })
    })).max(4)
});

export const SurveySchema = z.object({
    general: z.object({
        estado: z.string().nonempty("El estado es requerido"),
        titulo: z.string().nonempty("El título es requerido"),
        descripcion: z.string().nonempty("La descripción es requerida"),
        concepto_id: z.number().min(1, { message: "El Concepto es requerido" }),
        tipo_id: z.number().min(1, { message: "El tipo de Encuesta es requerida" }),
        obligatoria: z.string().nonempty("Debe definir si la encuesta es obligatoria"),
        plantilla_id: z.number().nonnegative(),
    }),
    preguntas: z.array(SurveyQuestionSchema),
    programacion: z.object({
        fecha_inicio: z.string().nonempty("La fecha de inicio es requerida"),
        fecha_fin: z.string().nonempty("La fecha de finalización es requerida"),
        frecuencia: z.enum(SURVEY_FREQUENCIES, { message: "La frecuencia es requerido" }),
        hora_ejecucion: z.string().nonempty("La hora de ejecución es requerida"),
        valores_frecuencia: z.array(z.string()),
    }),
    destinatarios: z.object({
        tipo_id: z.number().min(1, { message: "El tipo de objetivo es requerido" }),
        destinatario_tipo: z.string().nonempty("El tipo de destinatario es requerido"),
        destinatarios: z.array(z.number()).min(1, { message: "Debe seleccionar al menos un destinatario" }),
    })
})
