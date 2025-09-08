import { z } from 'zod';
import {
    AssitedEvaluationFilterSchema,
    AssitedEvaluationObservationSchema,
    AssitedEvaluationManualSchema
} from "@/zod/assisted-evaluation";

export type AssitedEvaluationFilter = z.infer<typeof AssitedEvaluationFilterSchema>
export type AssitedEvaluationObservation = z.infer<typeof AssitedEvaluationObservationSchema>
export type AssitedEvaluationManual = z.infer<typeof AssitedEvaluationManualSchema>

export type EventoRespuesta = {
    id: number;
    respuesta_texto: string;
};

export type Pregunta = {
    id: number;
    evento: string;
    pregunta: string;
    evento_respuestas_posibles: EventoRespuesta[];
};

export type Curso = {
    curso_id: number;
    nombre_curso: string;
    colegio_id: number;
    grado_id: number;
    nivel_educativo_id: number;
    creado_por: number;
    actualizado_por: number;
    fecha_creacion: string;
    fecha_actualizacion: string;
    activo: boolean;
};

export type CatalogResponse = {
    data: {
        preguntas: Pregunta[];
        cursos: Curso[];
    }
};


export type Persona = {
    nombres: string;
    apellidos: string;
    numero_documento: string;
};

export type AlumnoEvento = {
    id: number;
    fecha: string;
    hora: string | null;
    observacion: string | null;
    evento_respuesta_posible_id: number;
};

export type Alumno = {
    email: string;
    personas: Persona;
    alumno_id: number;
    alumnos_eventos: AlumnoEvento[];
    observacion: string;
    hora: string;
};

export type AlumnosResponse = {
    alumnosEncuestados: {
        alumnos: Alumno;
    }[]
};

export type AlumnoFormatted = {
    alumno_nombre: string;
    alumno_id: number;
    respuesta_id: number | null;
    observacion: string | null;
    hora: string;
};

export type PersonaResponsable = {
    nombres: string;
    apellidos: string;
    persona_id: number;
}

export type AlumnoEventoItem = {
    id: number;
    alumno_id: number;
    eventos_preguntas: Pregunta;
    evento_respuestas_posibles: EventoRespuesta;
    personas: PersonaResponsable;
    fecha: string | null;
    hora: string | null;
    observacion: string;
}