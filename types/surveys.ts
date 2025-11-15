import { z } from "zod"
import { SurveySchema } from "@/zod/surveys"

export type ISurveySchema = z.infer<typeof SurveySchema>;

export type ISurveyCatalogs = {
    estados: {
        encuesta_estado_id: number;
        encuesta_estado_nombre: string;
    }[],
    conceptosAsociados: {
        concepto_asociado_id: number;
        concepto_asociado_nombre: string;
    }[],
    tiposEncuesta: {
        tipo_encuesta_id: number;
        tipo_encuesta_nombre: string;
    }[],
    tiposPreguntas: {
        tipo_pregunta_id: number;
        nombre: string;
    }[],
}