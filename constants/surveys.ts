

export const SURVEY_STATES = ["borrador", "activo", "inactivo", "programado", "cerrada"] as const;
export const SURVEY_FREQUENCIES = ["diaria", "semanal", "mensual", "personalizada"] as const;
export const SURVEY_MANDATORY = ['SI', 'NO'];
export const SURVEY_QUESTION_TONES = [
    {
        nombre: 'Positiva',
        valor: 0
    },
    {
        nombre: 'Neutra',
        valor: 1
    },
    {
        nombre: 'Negativa',
        valor: 2
    }
]