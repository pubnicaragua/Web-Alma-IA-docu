import { fetchWithAuth } from "@/lib/api-config";

// Interfaces para la API
export interface CreateReportData {
  fecha: string;
  url_reporte: string;
  tipo: string;
  periodo_evaluado: string;
  url_anexos: string[];
  observaciones: string;
  estado: string;
  creado_por: string;
}

export interface ApiReport {
  alumno_informe_id: number;
  alumno_id: number;
  fecha: string;
  url_reporte: string;
  tipo: string;
  periodo_evaluado: string;
  url_anexos: string[];
  observaciones: string;
  creado_por: string;
  estado: string;
}

// Interfaces para la UI
export interface Report {
  id: string;
  studentId: string;
  date: string;
  reportUrl: string;
  type: string;
  evaluationPeriod: string;
  attachments: string[];
  observations: string;
  createdBy: string;
  status: string;
  statusColor: string;
}

export interface APIReportGeneral {
  informe_id: number;
  tipo: string;
  nivel: string;
  fecha_generacion: string;
  url_reporte: string;
  creado_por: number;
  creado_por_nombre: string;
  actualizado_por: number;
  actualizado_por_nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  activo: boolean;
  colegio_id: number;
  curso_id: number;
  periodo_anio: number;
  periodo_mes: number;
  periodo_inicio: string;
  periodo_fin: string;
  periodo: string;
  curso?: {
    curso_id: number;
    grado_id: number;
    colegio_id: number;
    nombre_curso: string;
    nivel_educativo_id: number;
    activo: boolean;
  };
}

// Función para convertir el formato de la API al formato de la UI
function mapApiReportsToReports(apiReports: ApiReport[]): Report[] {
  return apiReports.map((apiReport) => {
    // Determinar el color del estado
    let statusColor = "#4CAF50"; // Verde por defecto para "Activo"
    if (apiReport.estado === "Inactivo") {
      statusColor = "#F44336"; // Rojo para "Inactivo"
    } else if (apiReport.estado === "Pendiente") {
      statusColor = "#FFC107"; // Amarillo para "Pendiente"
    } else if (apiReport.estado === "Archivado") {
      statusColor = "#9E9E9E"; // Gris para "Archivado"
    }

    // Formatear la fecha
    const date = new Date(apiReport.fecha);
    const formattedDate = date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return {
      id: apiReport.alumno_informe_id.toString(),
      studentId: apiReport.alumno_id.toString(),
      date: formattedDate,
      reportUrl: apiReport.url_reporte,
      type: apiReport.tipo,
      evaluationPeriod: apiReport.periodo_evaluado,
      attachments: apiReport.url_anexos,
      observations: apiReport.observaciones,
      createdBy: apiReport.creado_por,
      status: apiReport.estado,
      statusColor,
    };
  });
}

// Datos de ejemplo para cuando la API no está disponible
const sampleReports: Report[] = [
  {
    id: "801",
    studentId: "101",
    date: "15/06/2023",
    reportUrl: "https://storage.colegio.com/informes/801.pdf",
    type: "Académico",
    evaluationPeriod: "Primer Semestre 2023",
    attachments: ["https://storage.colegio.com/anexos/801-1.pdf"],
    observations: "El alumno muestra mejora en matemáticas",
    createdBy: "profesor.jimenez@colegio.com",
    status: "Activo",
    statusColor: "#4CAF50",
  },
  {
    id: "802",
    studentId: "102",
    date: "20/06/2023",
    reportUrl: "https://storage.colegio.com/informes/802.pdf",
    type: "Conductual",
    evaluationPeriod: "Primer Semestre 2023",
    attachments: [
      "https://storage.colegio.com/anexos/802-1.pdf",
      "https://storage.colegio.com/anexos/802-2.pdf",
    ],
    observations: "El alumno ha mejorado su comportamiento en clase",
    createdBy: "orientador.perez@colegio.com",
    status: "Activo",
    statusColor: "#4CAF50",
  },
  {
    id: "803",
    studentId: "103",
    date: "25/06/2023",
    reportUrl: "https://storage.colegio.com/informes/803.pdf",
    type: "Psicológico",
    evaluationPeriod: "Primer Semestre 2023",
    attachments: [],
    observations:
      "Se recomienda seguimiento por parte del departamento de orientación",
    createdBy: "psicologo.martinez@colegio.com",
    status: "Pendiente",
    statusColor: "#FFC107",
  },
  {
    id: "804",
    studentId: "104",
    date: "30/06/2023",
    reportUrl: "https://storage.colegio.com/informes/804.pdf",
    type: "Académico",
    evaluationPeriod: "Primer Semestre 2023",
    attachments: ["https://storage.colegio.com/anexos/804-1.pdf"],
    observations: "El alumno necesita refuerzo en matemáticas",
    createdBy: "profesor.rodriguez@colegio.com",
    status: "Activo",
    statusColor: "#4CAF50",
  },
  {
    id: "805",
    studentId: "105",
    date: "05/07/2023",
    reportUrl: "https://storage.colegio.com/informes/805.pdf",
    type: "Conductual",
    evaluationPeriod: "Primer Semestre 2023",
    attachments: [],
    observations:
      "Se ha observado una mejora significativa en su comportamiento",
    createdBy: "orientador.gomez@colegio.com",
    status: "Archivado",
    statusColor: "#9E9E9E",
  },
];

export async function fetchReports(): Promise<APIReportGeneral[]> {
  try {
    let baseUrl = "/informes/generales";

    // Obtener los IDs de curso del localStorage
    const storedCursos =
      typeof window !== "undefined"
        ? localStorage.getItem("docente_cursos") // Usamos la misma llave que para los alumnos
        : null;

    if (storedCursos) {
      let cursoIds: number[] = [];
      try {
        cursoIds = JSON.parse(storedCursos);
      } catch {
        console.warn("No se pudo parsear 'docente_cursos' de localStorage.");
      }

      if (Array.isArray(cursoIds) && cursoIds.length > 0) {
        // Construir query params con todos los curso_id
        // Ejemplo: /informes/generales?curso_id=9&curso_id=18
        const params = new URLSearchParams();
        cursoIds.forEach((id) => params.append("curso_id", id.toString())); // Aquí cambia "colegio_id" a "curso_id"

        baseUrl += `?${params.toString()}`;
      }
    }

    const response = await fetchWithAuth(baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error al obtener informes: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Error al obtener informes, intente más tarde");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Función para obtener un informe específico por ID
export async function fetchReportById(
  id: string
): Promise<APIReportGeneral | null> {
  try {
    const response = await fetchWithAuth(`/alumnos/informes/${id}`);
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    return null;
  }
}

export async function createReport(
  reportData: CreateReportData
): Promise<ApiReport> {
  try {
    const response = await fetchWithAuth("/alumnos/informes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear el informe");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
}
