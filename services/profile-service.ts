"use client";

import { fetchWithAuth } from "@/lib/api-config";
import { cacheService } from "@/lib/cache-service";

export interface ProfileResponse {
  usuario: {
    creado_por: number;
    actualizado_por: number;
    fecha_creacion: string;
    fecha_actualizacion: string;
    activo: boolean;
    usuario_id: number;
    nombre_social: string | null;
    email: string;
    encripted_password: string;
    rol_id: number;
    telefono_contacto: string;
    ultimo_inicio_sesion: string;
    estado_usuario: string;
    intentos_inicio_sesion: number;
    persona_id: number;
    idioma_id: number;
    auth_id: string;
    url_foto_perfil: string;
  };
  persona: {
    creado_por: number;
    actualizado_por: number;
    fecha_creacion: string;
    fecha_actualizacion: string;
    activo: boolean;
    persona_id: number;
    tipo_documento: string;
    numero_documento: string;
    nombres: string;
    apellidos: string;
    genero_id: number;
    estado_civil_id: number;
    fecha_nacimiento: string;
    telefono_contacto?: string;
  };
  rol: {
    creado_por: number;
    actualizado_por: number;
    fecha_creacion: string;
    fecha_actualizacion: string;
    activo: boolean;
    nombre: string;
    descripcion: string;
    rol_id: number;
  };
  docentes: Array<{
    docente_id: number;
    especialidad: string;
    colegios: Array<{
      nombre: string;
      colegio_id: number;
      dependencia: string;
      tipo_colegio: string;
      nombre_fantasía: string;
    }>;
    docentes_cursos: Array<{
      ano_escolar: number;
      cursos: {
        curso_id: number;
        grado_id: number;
        nombre_curso: string;
      };
    }>;
  }>;
  funcionalidades: Array<{
    id: number;
    nombre: string;
    descripcion: string;
  }>;
}

function guardarCursosEnLocalStorage(profile?: ProfileResponse) {
  if (typeof window === "undefined") return;

  if (localStorage.getItem("docente_cursos")) return;

  if (!profile || !profile.docentes) return;

  if (profile.docentes.length === 0) return;

  const cursosSet = new Set<number>();

  profile.docentes.forEach((docente) => {
    docente.docentes_cursos.forEach((cursoDocente) => {
      cursosSet.add(cursoDocente.cursos.curso_id);
    });
  });

  const cursosArray = Array.from(cursosSet);

  localStorage.setItem("docente_cursos", JSON.stringify(cursosArray));
}

export async function fetchUserProfile(
  options: { forceRefresh?: boolean } = {}
): Promise<ProfileResponse | null> {
  const cacheKey = "user-profile";

  // Verificar cache primero
  if (!options.forceRefresh) {
    const cachedProfile = cacheService.get<ProfileResponse>(cacheKey);
    if (cachedProfile) {
      return cachedProfile;
    }
  }

  try {
    const response = await fetchWithAuth("/perfil/obtener", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    guardarCursosEnLocalStorage(data);

    // Guardar en cache por 10 minutos
    cacheService.set(cacheKey, data, 10 * 60 * 1000);

    return data;
  } catch (error) {
    return null;
  }
}

export interface UpdateProfileData {
  nombre_social: string | null;
  email: string;
  encripted_password: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  numero_documento: string;
  telefono_contacto: string;
  url_foto_perfil: string | null;
}

export type ProfileData = UpdateProfileData;

export const updateProfile = async (
  userId: number,
  data: Partial<UpdateProfileData>
): Promise<ProfileResponse> => {
  try {
    const response = await fetchWithAuth("/alumnos/perfil/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el perfil");
    }

    // Después de actualizar exitosamente, obtener el perfil actualizado
    const updatedProfile = await fetchUserProfile({ forceRefresh: true });

    if (!updatedProfile) {
      throw new Error("No se pudo obtener el perfil actualizado");
    }

    return updatedProfile;
  } catch (error) {
    throw error;
  }
};
export async function fetchUserProfileBitacora(): Promise<ProfileResponse | null> {
  try {
    const response = await fetchWithAuth("/perfil/obtener", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    guardarCursosEnLocalStorage(data);
    return data;
  } catch (error) {
    return null;
  }
}
