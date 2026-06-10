import { fetchWithAuth } from "@/lib/api-config";
import { fetchUserProfile } from "./profile-service";

// Interfaces para los datos de la API según la estructura real
export interface ApiSchool {
  colegio_id: number;
  nombre: string;
  nombre_fantasia: string;
  tipo_colegio: string;
  dependencia: string;
  sitio_web: string;
  direccion: string;
  telefono_contacto: string;
  correo_electronico: string;
  creado_por: number;
  actualizado_por: number | null;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
  activo: boolean;
  comuna_id: number;
  region_id: number;
  pais_id: number;
  alerts: number;
  students: number;
}

// Nueva interface para la respuesta del endpoint usuarios_colegios
export interface ApiUsuarioColegioRelation {
  usuarios_colegio_id: number;
  usuario_id: number;
  colegio_id: number;
  rol_id: number;
  fecha_asignacion: string;
  usuario: {
    usuario_id: number;
    nombre_social: string;
    email: string;
  };
  colegio: {
    colegio_id: number;
    nombre: string;
    codigo: string;
  };
  rol: {
    rol_id: number;
    nombre: string;
    descripcion: string;
  };
}

// Interface para el componente
export interface School {
  id: string;
  name: string;
  fantasyName: string;
  type: string;
  dependency: string;
  website: string;
  address: string;
  contactPhone: string;
  email: string;
  alerts: number;
  students: number;
  color: string;
  isActive: boolean;
  communeId: number;
  regionId: number;
  countryId: number;
}

export async function loadSchools(): Promise<School[]> {
  try {
    const response = await fetchWithAuth(
      `/colegios`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      false
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener colegios: ${response.status} - ${errorText}`
      );
    }

    const apiSchools = (await response.json()) as ApiSchool[];

    // Verificación para asegurar que siempre haya datos
    if (!apiSchools || apiSchools.length === 0) {
      return [];
    }

    // Transformar la respuesta de la API al formato que espera el componente
    return apiSchools.map((school) => ({
      id: school.colegio_id.toString(),
      name: school.nombre,
      fantasyName: school.nombre_fantasia,
      type: school.tipo_colegio || "No especificado",
      dependency: school.dependencia || "No especificado",
      website: school.sitio_web || "",
      address: school.direccion || "",
      contactPhone: school.telefono_contacto || "",
      email: school.correo_electronico || "",
      alerts: school.alerts || 0,
      students: school.students || 0,
      color: "bg-gray-500",
      isActive: school.activo,
      communeId: school.comuna_id,
      regionId: school.region_id,
      countryId: school.pais_id,
    }));
  } catch (error) {
    throw error;
  }
}

// Función corregida para obtener colegios por usuario
export async function loadSchoolsByUsuario_id(
  usuario_id: number
): Promise<School[]> {
  try {
    const response = await fetchWithAuth(
      `/colegios/usuarios_colegios?usuario_id=${usuario_id}`,
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
        `Error al obtener colegios del usuario: ${response.status} - ${errorText}`
      );
    }

    const apiSchools = (await response.json()) as ApiSchool[];

    if (!apiSchools || apiSchools.length === 0) {
      return [];
    }

    // Transformar al formato School
    return apiSchools.map((school) => ({
      id: school.colegio_id.toString(),
      name: school.nombre,
      fantasyName: school.nombre_fantasia,
      type: school.tipo_colegio || "No especificado",
      dependency: school.dependencia || "No especificado",
      website: school.sitio_web || "",
      address: school.direccion || "",
      contactPhone: school.telefono_contacto || "",
      email: school.correo_electronico || "",
      alerts: school.alerts || 0,
      students: school.students || 0,
      color: "bg-blue-500",
      isActive: school.activo,
      communeId: school.comuna_id,
      regionId: school.region_id,
      countryId: school.pais_id,
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene un colegio por su ID
 * @param id ID del colegio a buscar
 * @returns El colegio encontrado o null si no existe
 */
export async function getSchoolById(
  id: string | number
): Promise<School | null> {
  try {
    const response = await fetchWithAuth(`/colegios`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();

      throw new Error(
        `Error al obtener el colegio: ${response.status} - ${errorText}`
      );
    }

    const apiSchools = (await response.json()) as ApiSchool[];
    const apiSchool = apiSchools.find((school) => school.colegio_id == id);
    if (!apiSchool) {
      return null;
    }
    // Transformar la respuesta de la API al formato que espera el componente
    return {
      id: apiSchool.colegio_id.toString(),
      name: apiSchool.nombre,
      fantasyName: apiSchool.nombre_fantasia,
      type: apiSchool.tipo_colegio,
      dependency: apiSchool.dependencia,
      website: apiSchool.sitio_web,
      address: apiSchool.direccion,
      contactPhone: apiSchool.telefono_contacto,
      email: apiSchool.correo_electronico,
      alerts: apiSchool.alerts || 0,
      students: apiSchool.students || 0,
      color: "bg-gray-500",
      isActive: apiSchool.activo,
      communeId: apiSchool.comuna_id,
      regionId: apiSchool.region_id,
      countryId: apiSchool.pais_id,
    };
  } catch (error) {
    throw error;
  }
}
