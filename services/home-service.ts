import { fetchWithAuth } from "@/lib/api-config";

export interface Student {
  name: string;
  image: string;
}

// Actualizada para coincidir con la estructura de la API
export interface RecentAlert {
  alumno_alerta_id: number;
  anonimo: boolean;
  alumno_id: number;
  fecha_generada: string;
  estado: string;
  alumnos?: {
    personas?: {
      nombres: string;
      apellidos: string;
    };
    url_foto_perfil?: string;
  };
  alertas_tipos?: {
    nombre: string;
  };
  alertas_severidades?: {
    nombre: string;
  };
  alertas_prioridades?: {
    nombre: string;
  };
  alertas_origenes?: {
    nombre: string;
  };
}

export interface ImportantDate {
  calendario_fecha_importante_id: number;
  colegio_id: number;
  curso_id: number;
  calendario_escolar_id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: string;
  creado_por: number;
  actualizado_por: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  activo: boolean;
  colegios?: {
    nombre: string;
    colegio_id: number;
  };
  cursos?: {
    grados?: {
      nombre: string;
      grado_id: number;
    };
    nombre_curso: string;
    niveles_educativos?: {
      nombre: string;
      nivel_educativo_id: number;
    };
  };
  calendarios_escolares?: {
    fecha_fin: string;
    ano_escolar: number;
    dias_habiles: number;
    fecha_inicio: string;
    calendario_escolar_id: number;
  };
}

export interface TotalAlert {
  label: string;
  value: number;
  percentage: string;
  color: string;
}

export interface Emotion {
  name: string;
  value: number;
  cantidad_respuestas?: number;
  cantidad_negativas?: number;
  cantidad_neutras?: number;
  color: string;
}

export interface CardData {
  alumnos: {
    activos: number;
    inactivos: number;
    frecuentes: number;
    totales: number;
  };
  sos_alma: {
    activos: number;
    vencidos: number;
    por_vencer: number;
    totales: number;
  };
  denuncias: {
    activos: number;
    vencidos: number;
    por_vencer: number;
    totales: number;
  };
  alertas_alma: {
    activos: number;
    vencidos: number;
    por_vencer: number;
    totales: number;
  };
}

// Datos de ejemplo para fechas importantes
export const FALLBACK_IMPORTANT_DATES: ImportantDate[] = [
  {
    calendario_fecha_importante_id: 1,
    colegio_id: 1,
    curso_id: 1,
    calendario_escolar_id: 1,
    titulo: "Inicio de clases",
    descripcion: "Primer día del año escolar",
    fecha: "2025-02-28T00:00:00",
    tipo: "académico",
    creado_por: 1,
    actualizado_por: 1,
    fecha_creacion: "2025-05-12T17:36:28.764228",
    fecha_actualizacion: "2025-05-12T17:36:28.764228",
    activo: true,
    colegios: {
      nombre: "Colegio Bicentenario Santiago Centro",
      colegio_id: 1,
    },
    cursos: {
      grados: {
        nombre: "Quinto Básico",
        grado_id: 9,
      },
      nombre_curso: "1° Medio - Jornada Mañana - Colegio 1",
      niveles_educativos: {
        nombre: "Educación Básica",
        nivel_educativo_id: 1,
      },
    },
    calendarios_escolares: {
      fecha_fin: "2025-12-12T00:00:00",
      ano_escolar: 2025,
      dias_habiles: 190,
      fecha_inicio: "2025-02-28T00:00:00",
      calendario_escolar_id: 1,
    },
  },
  {
    calendario_fecha_importante_id: 2,
    colegio_id: 1,
    curso_id: 1,
    calendario_escolar_id: 1,
    titulo: "Feriado Nacional",
    descripcion: "Día de las Glorias Navales",
    fecha: "2025-05-21T00:00:00",
    tipo: "feriado",
    creado_por: 1,
    actualizado_por: 1,
    fecha_creacion: "2025-05-12T17:36:28.764228",
    fecha_actualizacion: "2025-05-12T17:36:28.764228",
    activo: true,
    colegios: {
      nombre: "Colegio Bicentenario Santiago Centro",
      colegio_id: 1,
    },
  },
  {
    calendario_fecha_importante_id: 3,
    colegio_id: 1,
    curso_id: 1,
    calendario_escolar_id: 1,
    titulo: "Semana de Evaluaciones",
    descripcion: "Evaluaciones finales del primer semestre",
    fecha: "2025-06-05T00:00:00",
    tipo: "académico",
    creado_por: 1,
    actualizado_por: 1,
    fecha_creacion: "2025-05-12T17:36:28.764228",
    fecha_actualizacion: "2025-05-12T17:36:28.764228",
    activo: true,
  },
  {
    calendario_fecha_importante_id: 4,
    colegio_id: 1,
    curso_id: 1,
    calendario_escolar_id: 1,
    titulo: "Vacaciones de Invierno",
    descripcion: "Receso escolar de invierno",
    fecha: "2025-07-10T00:00:00",
    tipo: "vacaciones",
    creado_por: 1,
    actualizado_por: 1,
    fecha_creacion: "2025-05-12T17:36:28.764228",
    fecha_actualizacion: "2025-05-12T17:36:28.764228",
    activo: true,
  },
  {
    calendario_fecha_importante_id: 5,
    colegio_id: 1,
    curso_id: 1,
    calendario_escolar_id: 1,
    titulo: "Día del Profesor",
    descripcion: "Celebración del día del profesor",
    fecha: "2025-10-16T00:00:00",
    tipo: "celebración",
    creado_por: 1,
    actualizado_por: 1,
    fecha_creacion: "2025-05-12T17:36:28.764228",
    fecha_actualizacion: "2025-05-12T17:36:28.764228",
    activo: true,
  },
  {
    calendario_fecha_importante_id: 6,
    colegio_id: 1,
    curso_id: 1,
    calendario_escolar_id: 1,
    titulo: "Fiestas Patrias",
    descripcion: "Celebración de fiestas patrias",
    fecha: "2025-09-18T00:00:00",
    tipo: "feriado",
    creado_por: 1,
    actualizado_por: 1,
    fecha_creacion: "2025-05-12T17:36:28.764228",
    fecha_actualizacion: "2025-05-12T17:36:28.764228",
    activo: true,
  },
  {
    calendario_fecha_importante_id: 7,
    colegio_id: 1,
    curso_id: 1,
    calendario_escolar_id: 1,
    titulo: "Ceremonia de Graduación",
    descripcion: "Ceremonia de graduación de estudiantes",
    fecha: "2025-12-15T00:00:00",
    tipo: "ceremonia",
    creado_por: 1,
    actualizado_por: 1,
    fecha_creacion: "2025-05-12T17:36:28.764228",
    fecha_actualizacion: "2025-05-12T17:36:28.764228",
    activo: true,
  },
];

export async function fetchCardData(): Promise<CardData> {
  try {
    const response = await fetchWithAuth("/home/cards/emociones", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener datos de tarjetas: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchRecentAlerts(
  estado?: string
): Promise<RecentAlert[]> {
  // Añadir parámetro estado
  try {
    try {
      let endpoint = "/home/alertas/recientes";
      if (estado) {
        endpoint += `?estado=${estado}`; // Añadir el parámetro de estado a la URL
      }

      const response = await fetchWithAuth(endpoint, {
        // Usar el endpoint modificado
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      // Verificar si los datos tienen la estructura esperada
      if (Array.isArray(data) && data.length > 0) {
        return data;
      } else {
        return [];
      }
    } catch (error) {
      return FALLBACK_RECENT_ALERTS;
    }
  } catch (error) {
    throw error;
  }
}

export async function fetchImportantDates(): Promise<ImportantDate[]> {
  try {
    const response = await fetchWithAuth("/home/fechas/importantes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error al obtener fechas importantes: ${response.status} - ${errorText}`
      );
    }

    let data;
    try {
      data = await response.json();

      // Verificar si los datos tienen el formato esperado
      if (!data || !Array.isArray(data)) {
        throw new Error(
          "No se pudo obtener las fechas importantes, inténtelo más tarde"
        );
      }

      return data;
    } catch (parseError) {
      throw new Error(
        "No se pudo obtener las fechas importantes, inténtelo más tarde"
      );
    }
  } catch (error) {
    throw new Error(
      "No se pudo obtener las fechas importantes, inténtelo más tarde"
    );
  }
}

export async function fetchTotalAlerts(): Promise<TotalAlert[]> {
  try {
    const response = await fetchWithAuth("/home/alertas/totales", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error al obtener alertas totales: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchEmotions(): Promise<Emotion[]> {
  try {
    const response = await fetchWithAuth("/home/emotions/general", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener emociones: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchEmotionsByDate(date: string): Promise<Emotion[]> {
  try {
    const response = await fetchWithAuth(
      "/home/emotions/general" + "?fecha_hasta=" + date,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener emociones: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchEmotionsForGrade(
  grado_id: number
): Promise<Emotion[]> {
  try {
    const response = await fetchWithAuth(
      "/comparativa/emociones/grado?grado_id=" + grado_id,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener emociones: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
export async function fetchPatologieForGrade(
  grado_id: number
): Promise<Emotion[]> {
  try {
    const response = await fetchWithAuth(
      "/comparativa/patologias/grado?grado_id=" + grado_id,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener emociones: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchPatologieGeneral(): Promise<Emotion[]> {
  try {
    const response = await fetchWithAuth("/home/barra/patologias", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener emociones: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchPatologieByDate(date: string): Promise<Emotion[]> {
  try {
    const response = await fetchWithAuth(
      "/home/barra/patologias" + "?fecha_hasta=" + date,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener emociones: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchNeurodivergences(): Promise<Emotion[]> {
  try {
    const response = await fetchWithAuth("/home/barra/neurodivergencias", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener emociones: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchfetchNeurodivergencesByDate(
  date: string
): Promise<Emotion[]> {
  try {
    const response = await fetchWithAuth(
      "/home/barra/neurodivergencias" + "?fecha_hasta=" + date,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener emociones: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
