import { fetchWithAuth } from "@/lib/api-config";
import type { Grade } from "@/services/grade-service";

export interface SchoolCourse {
  curso_id: number;
  nombre_curso: string;
  grados?: Grade;
}

export async function fetchCoursesForSchool(
  schoolId: string
): Promise<SchoolCourse[]> {
  const params = new URLSearchParams({ colegio_id: schoolId });
  const response = await fetchWithAuth(
    `/colegios/cursos?${params.toString()}`,
    { method: "GET" },
    false
  );

  if (!response.ok) {
    throw new Error(`Error al obtener cursos: ${response.status}`);
  }

  const courses = await response.json();
  return Array.isArray(courses) ? courses : [];
}
