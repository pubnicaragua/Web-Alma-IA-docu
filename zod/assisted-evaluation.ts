import { z } from 'zod';

export const AssitedEvaluationFilterSchema = z.object({
    alumno_nombre: z.string().optional(),
    curso_id: z.number().positive(),
    pregunta_id: z.number().positive(),
    fecha: z.date().optional(),
});

export const AssitedEvaluationObservationSchema = z.object({
    evento_respuesta_posible_id: z.number().positive().nullable(),
    alumno_id: z.number().positive(),
    curso_id: z.number().positive(),
    evento_id: z.number().positive(),
    fecha: z.string().optional(),
    hora: z.string().nonempty(),
    observacion: z.string().optional(),
});

export const AssitedEvaluationManualSchema = z.object({
    alumno_id: z.number().positive(),
    evento_id: z.number().positive(),
    evento_respuesta_posible_id: z.number().positive(),
    fecha: z.date(),
    hora: z.string().nonempty(),
    observacion: z.string().optional(),
});