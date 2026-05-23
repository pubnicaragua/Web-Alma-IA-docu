import { fetchWithAuth } from "@/lib/api-config";
import { cacheService } from "@/lib/cache-service";
import {
  StudentAlert, 
  StudentGeneral, 
  StudentMedicalRecord, 
  StudentRepresentative, 
  StudentReport as StudentDetailReport
} from "@/types/student";

// Interfaces para la respuesta de la API
export interface ApiStudent {
  alumno_id: number;
  colegio_id: number;
  url_foto_perfil: string;
  telefono_contacto1: string;
  telefono_contacto2: string;
  email: string;
  creado_por: number;
  actualizado_por: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  activo: boolean;
  persona_id: number;
  consentimiento: boolean;
  personas: {
    nombres: string;
    apellidos: string;
    persona_id: number;
    fecha_nacimiento: string;
    numero_documento: string;
    usuarios: Array<{
      rol_id: number;
      usuario_id: number;
    }>;
  };
  colegios: {
    nombre: string;
    colegio_id: number;
  };
  cursos: Array<{
    grados: {
      nombre: string;
      grado_id: number;
    };
    curso_id: number;
    nombre_curso: string;
    niveles_educativos: {
      nombre: string;
      nivel_educativo_id: number;
    };
  }>;
}

// Interfaz para el modelo de estudiante usado en la UI
export interface Student {
  id: string;
  name: string;
  level: string;
  course: string;
  age: number;
  status: string;
  image?: string;
  email?: string;
  phone?: string;
}

export interface StudentReport {
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

export interface StudentReportFilters {
  alumno_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo?: string;
  periodo_evaluado?: string;
  estado?: string;
}

// Nueva interfaz para la respuesta detallada del alumno
export interface StudentDetailResponse {
  alumno: StudentGeneral;
  ficha: StudentMedicalRecord[];
  apoderados: StudentRepresentative[];
  alertas: StudentAlert[];
  informes: StudentDetailReport[];
  emociones: Array<{
    nombre: string;
    valor: number;
  }>;
  datosComparativa: Array<{
    name: string;
    alumno: number;
    promedio: number;
  }>;
}

// Función para transformar los datos de la API a nuestro modelo de Student
export function mapApiStudentsToStudents(apiStudents: ApiStudent[]): Student[] {
  try {
    if (!Array.isArray(apiStudents)) {
      return [];
    }

    const mapped = apiStudents.map((apiStudent) => {
      try {
        // Calcular la edad a partir de la fecha de nacimiento
        const fechaNacimiento = apiStudent.personas?.fecha_nacimiento;
        const edad = fechaNacimiento ? calcularEdad(fechaNacimiento) : 0;

        // Obtener nivel y curso de la estructura anidada
        const curso = apiStudent.cursos?.[0]?.nombre_curso || "No especificado";
        const grado =
          apiStudent.cursos?.[0]?.grados?.nombre || "No especificado";

        return {
          id: apiStudent.alumno_id?.toString() || "",
          name: `${apiStudent.personas?.nombres || ""} ${apiStudent.personas?.apellidos || ""
            }`.trim(),
          level: grado,
          course: curso,
          age: edad,
          status: apiStudent.activo ? "Activo" : "Inactivo",
          image: apiStudent.url_foto_perfil || "",
          email: apiStudent.email || "",
          phone: apiStudent.telefono_contacto1 || "",
        };
      } catch (error) {
        console.error("Error parsing student:", error, apiStudent);
        return null;
      }
    });

    return mapped.filter((s) => s !== null) as Student[];
  } catch (error) {
    console.error("Error in mapApiStudentsToStudents:", error);
    return [];
  }
}

// Calcular edad correctamente
function calcularEdad(fechaNacimiento: Date | string): number {
  try {
    // Asegurarnos de que tenemos un objeto Date
    const fechaNac =
      typeof fechaNacimiento === "string"
        ? new Date(fechaNacimiento)
        : fechaNacimiento;

    // Validar que la fecha es válida
    if (isNaN(fechaNac.getTime())) {
      console.warn("Fecha de nacimiento inválida:", fechaNacimiento);
      return 0;
    }

    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    // Ajustar la edad si aún no ha pasado el mes de cumpleaños
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  } catch (error) {
    return 0;
  }
}

// Función para obtener informes de estudiantes
export const getStudentReports = async (
  filters: StudentReportFilters = {}
): Promise<StudentReport[]> => {
  try {
    const response = await fetchWithAuth("/informes/alumnos", {
      method: "POST",
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText ||
        response.statusText ||
        "Error al obtener informes de alumnos"
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Asumo que Student y ApiStudent están tipados en otro lado

export async function fetchStudents(colegioId?: string): Promise<Student[]> {
  const storedCursos =
    typeof window !== "undefined"
      ? localStorage.getItem("docente_cursos")
      : null;

  // Incluir colegioId en la clave del caché para evitar conflictos entre colegios  
  const cacheKey = `students-${storedCursos || "all"}-${colegioId || "default"}`;

  const cachedStudents = cacheService.get<Student[]>(cacheKey);
  if (cachedStudents) {
    return cachedStudents;
  }

  try {
    let baseUrl = "/alumnos";

    // Construir parámetros de consulta  
    const params = new URLSearchParams();

    if (colegioId) {
      params.append("colegio_id", colegioId);
    }

    if (storedCursos) {
      try {
        const cursoIds = JSON.parse(storedCursos);
        if (Array.isArray(cursoIds) && cursoIds.length > 0) {
          cursoIds.forEach((id) =>
            params.append("cursos.curso_id", id.toString())
          );
        }
      } catch {
        console.warn("No se pudo parsear 'docente_cursos' de localStorage.");
      }
    }

    if (params.toString()) {
      baseUrl += `?${params.toString()}`;
    }

    // Usar addSchoolId: false para evitar duplicar el colegio_id  
    const response = await fetchWithAuth(baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }, false);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error al obtener alumnos: ${response.status} - ${errorText}`
      );
    }

    const apiStudents = (await response.json()) as ApiStudent[];
    const students = mapApiStudentsToStudents(apiStudents);

    // Cache por 5 minutos  
    cacheService.set(cacheKey, students, 5 * 60 * 1000);

    return students;
  } catch (error) {
    throw error;
  }
}

// Función para obtener un estudiante por ID
export async function fetchStudentById(id: string): Promise<Student | null> {
  try {
    // Realizar la solicitud GET a la API
    const response = await fetchWithAuth(`/alumnos/${id}`, {
      method: "GET",
    });

    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Intentar leer el mensaje de error
      const errorText = await response.text();
      throw new Error(
        `Error al obtener alumno: ${response.status} - ${errorText}`
      );
    }

    // Intentar parsear la respuesta como JSON
    const apiStudent = (await response.json()) as ApiStudent;

    // Transformar los datos de la API a nuestro modelo de Student
    const students = mapApiStudentsToStudents([apiStudent]);
    return students[0] || null;
  } catch (error) {
    throw error; // Propagar el error para que se maneje en el componente
  }
}

// Nueva función para obtener los detalles completos de un estudiante
export async function fetchStudentDetails(
  id: string
): Promise<StudentDetailResponse | null> {
  try {
    // Realizar la solicitud GET a la API con la nueva ruta
    const response = await fetchWithAuth(`/alumnos/detalle/${id}`, {
      method: "GET",
    });

    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Intentar leer el mensaje de error
      const errorText = await response.text();

      throw new Error(
        `Error al obtener detalles del alumno: ${response.status} - ${errorText}`
      );
    }

    // Intentar parsear la respuesta como JSON
    const studentDetails = (await response.json()) as StudentDetailResponse;
    return studentDetails;
  } catch (error) {
    throw error; // Propagar el error para que se maneje en el componente
  }
}
