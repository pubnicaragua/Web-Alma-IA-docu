import { fetchWithAuth } from "@/lib/api-config";
import {
  ApiStudent,
  mapApiStudentsToStudents,
  Student,
} from "./students-service";
import { cacheService } from "@/lib/cache-service";

export async function getNotificationCount(colegioId?: string): Promise<number> {
  const cacheKey = colegioId ? `notification-count-${colegioId}` : "notification-count";

  const cachedCount = cacheService.get<number>(cacheKey);
  if (cachedCount !== null) {
    return cachedCount;
  }

  try {
    let endpoint = `/alumnos/alertas/conteo`;

    if (colegioId) {
      endpoint += `?colegio_id=${colegioId}`;
    }

    const response = await fetchWithAuth(endpoint, {}, false);

    if (!response.ok) {
      throw new Error("Error al obtener el conteo de notificaciones");
    }

    // Actualizar para manejar la nueva estructura de respuesta  
    const data = await response.json() as {
      total_alertas: number;
      pendientes: number;
      asignadas: number;
      en_proceso: number;
      resueltas: number;
      cerradas: number;
      anuladas: number;
      no_leidas?: number;
    };

    // Usar 'no_leidas' para la campanita, ya que el usuario espera que bajen al verlas
    const count = data.no_leidas ?? data.pendientes ?? 0;

    cacheService.set(cacheKey, count, 2 * 60 * 1000);

    return count;
  } catch (error) {
    return 0;
  }
}
export async function searchStudents(term: string, colegioId?: string): Promise<Student[]> {
  try {
    const storedCursos =
      typeof window !== "undefined"
        ? localStorage.getItem("docente_cursos")
        : null;

    let bodyPayload: { termino: string; cursos?: number[]; colegio_id?: string } = {
      termino: term,
    };

    if (colegioId) {
      bodyPayload.colegio_id = colegioId;
    }

    if (storedCursos) {
      try {
        const cursoIds = JSON.parse(storedCursos);
        if (Array.isArray(cursoIds) && cursoIds.length > 0) {
          bodyPayload.cursos = cursoIds;
        }
      } catch {
        console.warn("No se pudo parsear 'docente_cursos' de localStorage.");
      }
    }

    // Usar addSchoolId: false para evitar duplicar el colegio_id  
    const response = await fetchWithAuth("/alumnos/buscar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    }, false); // Pasar false para addSchoolId  

    if (!response.ok) {
      throw new Error("Error al buscar alumnos");
    }

    const data = (await response.json()) as ApiStudent[];
    const students = mapApiStudentsToStudents(data);
    return students || [];
  } catch (error) {
    throw error;
  }
}

export function invalidateNotificationCache(colegioId?: string): void {
  cacheService.clear(colegioId ? `notification-count-${colegioId}` : "notification-count");
}