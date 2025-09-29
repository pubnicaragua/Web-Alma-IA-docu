import { fetchApi, fetchWithAuth } from "@/lib/api-config";
import { DataPoint } from "@/components/line-chart-comparison";
import { Persona } from "../teachers-service";
import { parse, format, parseISO } from 'date-fns';

// Interfaces para los datos de la API según la estructura real
interface ApiPerson {
  nombres: string;
  apellidos: string;
  persona_id: number;
}

interface ApiAlertStudent {
  alumno_id: number;
  personas: {
    nombres: string;
    apellidos: string;
    persona_id: number;
  };
  url_foto_perfil?: string;
}

interface ApiAlertRule {
  nombre: string;
  alerta_regla_id: number;
}

interface ApiAlertOrigin {
  nombre: string;
  alerta_origen_id: number;
}

export interface ApiAlertSeverity {
  nombre: string;
  alerta_severidad_id: number;
}

export interface ApiAlertPriority {
  nombre: string;
  alerta_prioridad_id: number;
}

interface AlertState {
  alerta_estado_id: number;
  nombre_alerta_estado: string;
  creado_por: number;
  fecha_creacion: string;
  actualizado_por: number;
  fecha_actualizacion: string;
  activo: boolean;
}

interface ApiAlertType {
  nombre: string;
  alerta_tipo_id: number;
}

export interface AlertPage {
  alumno_alerta_id: number;
  url_image: string | null;
  url_audio: string | null;
  responsable_actual_id: string;
  alumno: {
    alumno_id: number;
    nombre: string;
    cursos: string;
    imagen: string;
  };
  fecha_generada: string;
  responsable: {
    nombre: string;
    imagen: string;
  };
  anonimo: boolean;
  origen: string;
  tipo: string;
  prioridad: string;
  prioridad_id: number;
  severidad: string;
  severidad_id: number;
  descripcion: string;
  accion_tomada: Record<string, any>;
  estado_id: string;
  estado: string;
}

export interface AlertPagev1 {
  alumno_alerta_id: number;
  url_image: string | null;
  url_audio: string | null;
  alumno: {
    alumno_id: number;
    nombre: string;
    cursos: string;
    imagen: string;
  };
  fecha_generada: string;
  responsable: {
    nombre: string;
    rol: string;
    imagen: string;
  };
  anonimo: boolean;
  regla: string;
  origen: string;
  tipo: string;
  prioridad: string;
  prioridad_id: number;
  severidad: string;
  severidad_id: number;
  descripcion: string;
  accion_tomada: any[];
  estado: string;
}

export interface ApiAlert {
  anonimo: boolean;
  url_image: string | null;
  url_audio: string | null;
  alumno_alerta_id: number;
  alumno_id: number;
  alerta_regla_id: number;
  fecha_generada: string;
  fecha_resolucion: string | null;
  alerta_origen_id: number;
  prioridad_id: number;
  severidad_id: number;
  accion_tomada: string | null;
  leida: boolean;
  responsable_actual_id: number | null;
  estado: string;
  creado_por: number;
  actualizado_por: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  activo: boolean;
  alertas_tipo_alerta_tipo_id: number;
  mensaje: string | null;
  alumnos: ApiAlertStudent;
  alertas_reglas: ApiAlertRule;
  alertas_origenes: ApiAlertOrigin;
  alertas_severidades: ApiAlertSeverity;
  alertas_prioridades: ApiAlertPriority;
  alertas_tipos: ApiAlertType;
  personas: ApiPerson | null;
  persona_responsable_actual: ApiPerson | null;
}

// Interfaces para la UI
export interface Alert {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: string;
  priority: string;
  isAnonymous: boolean;
  type: string;              // garantizar siempre string
  student: {                 // asegurar estructura consistente
    id: string;
    name: string;
    avatar?: string;
  };
  // nuevo campo obligatorio: id numérico del tipo
  alertTypeId: number;
  url_imagen: string | null;
  url_audio: string | null;
}

// ...existing code...

export function mapApiAlertsToAlerts(apiAlerts: ApiAlert[]): Alert[] {
  return apiAlerts.map((apiAlert) => {
    try {
      if (!apiAlert) throw new Error("Alert object is undefined");
      if (!apiAlert.alumnos) throw new Error("Student object is undefined");

      // Fecha/hora generada
      let formattedDate = "";
      let formattedTime = "";
      try {
        if (apiAlert.fecha_generada) {
          const d = new Date(apiAlert.fecha_generada);
          formattedDate = format(d, 'dd-MM-yyyy');
          formattedTime = format(d, 'hh:mm a');
        }
      } catch { }

      // Student safe access
      const studentName = apiAlert.alumnos?.personas?.nombres || "Estudiante";
      const studentLastName = apiAlert.alumnos?.personas?.apellidos || "";
      const studentId = (apiAlert.alumno_id ?? apiAlert.alumnos?.alumno_id)?.toString() || "0";

      // NORMALIZAR TIPO: obtener id numérico preferente y generar texto consistente
      const tipoNombreRaw = apiAlert.alertas_tipos?.nombre;
      const tipoIdFromField = apiAlert.alertas_tipo_alerta_tipo_id ?? apiAlert.alertas_tipos?.alerta_tipo_id;
      // si el nombre viene como "3" o "4" parsearlo
      const tipoIdFromName = typeof tipoNombreRaw === "string" && /^\d+$/.test(tipoNombreRaw.trim())
        ? parseInt(tipoNombreRaw.trim(), 10)
        : undefined;
      const alertTypeId = tipoIdFromName ?? tipoIdFromField ?? 0;

      // Normalizar texto a partir del id (más determinista)
      let alertTypeText = "General";
      // Mapeo determinista por id
      switch (alertTypeId) {
        case 1:
          alertTypeText = "Sos";
          break;
        case 2:
          alertTypeText = "Denuncias";
          break;
        case 3:
          alertTypeText = "Amarilla";
          break;
        case 4:
          alertTypeText = "Naranja";
          break;
        case 5:
          alertTypeText = "Roja";
          break;
        default:
          if (tipoNombreRaw && typeof tipoNombreRaw === "string") {
            const s = tipoNombreRaw.trim();
            if (!/^\d+$/.test(s)) {
              alertTypeText = s.charAt(0).toUpperCase() + s.slice(1);
            }
          }
      }
      // PRIORIDAD (igual lógica de fallback por nombre o id)
      let priority = "Media";
      const prioridadNombre = apiAlert.alertas_prioridades?.nombre;
      const prioridadId = apiAlert.prioridad_id;
      if (prioridadNombre) {
        const p = String(prioridadNombre).toLowerCase();
        if (p.includes("alta")) priority = "Alta";
        else if (p.includes("baja")) priority = "Baja";
        else priority = "Media";
      } else if (typeof prioridadId === "number") {
        if (prioridadId === 1) priority = "Alta";
        else if (prioridadId === 3) priority = "Baja";
        else priority = "Media";
      }

      // resto de mapeo...
      let status = apiAlert.estado || "Pendiente";
      status = String(status).charAt(0).toUpperCase() + String(status).slice(1);
      const isRead = Boolean(apiAlert.leida);
      const message = apiAlert.mensaje || "";
      const isAnonymous = Boolean(apiAlert.anonimo);
      const studentImage = apiAlert.alumnos?.url_foto_perfil || "/confident-businessman.png";

      return {
        id: apiAlert.alumno_alerta_id.toString(),
        title: alertTypeText,
        description: alertTypeText,
        detailedDescription: message,
        date: formattedDate,
        time: formattedTime,
        status,
        priority,
        type: alertTypeText,
        isRead,
        isAnonymous,
        actionTaken: apiAlert.accion_tomada || "",
        currentResponsible: apiAlert.responsable_actual_id ? apiAlert.responsable_actual_id.toString() : "0",
        student: {
          id: studentId,
          name: `${studentName} ${studentLastName}`.trim(),
          avatar: studentImage,
        },
        alertRuleId: apiAlert.alerta_regla_id?.toString() || "0",
        alertOriginId: apiAlert.alerta_origen_id?.toString() || "0",
        createdBy: apiAlert.creado_por?.toString() || "0",
        updatedBy: apiAlert.actualizado_por?.toString() || "0",
        creationDate: apiAlert.fecha_creacion,
        updateDate: apiAlert.fecha_actualizacion,
        isActive: apiAlert.activo || false,
        url_imagen: apiAlert.url_image || "",
        url_audio: apiAlert.url_audio || "",
        // exportar id numérico para uso en UI
        alertTypeId,
      };
    } catch (error) {
      throw error;
    }
  });
}

export async function fetchAlertsByType(type: string, colegio_id: string): Promise<Alert[]> {
  let endpoint = `/alumnos/obtenerAlertasPorId`

  if (type && colegio_id) {
    endpoint += `?colegio_id=${colegio_id}&alerta_tipo_id=${type}`
  }

  try {
    const response = await fetchWithAuth(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }, false);

    if (!response.ok) {
      // Intentar leer el mensaje de error
      const errorText = await response.text();

      throw new Error(
        `Error al obtener alertas: ${response.status} - ${errorText}`
      );
    }

    // Intentar parsear la respuesta como JSON
    const apiAlerts: ApiAlert[] = await response.json();

    // Convertir los datos de la API al formato de la UI
    const alerts = mapApiAlertsToAlerts(apiAlerts);
    return alerts;
  } catch (error) {
    // Usar datos de ejemplo en caso de error
    throw error;
  }
}

// Función para obtener todas las alertas
export async function fetchAlerts() {
  try {
    const response = await window.axios.get("/alumnos/alertas", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        page: 1,
        perPage: 10
      }
    });

    return response;


    if (!response.ok) {
      // Intentar leer el mensaje de error
      const errorText = await response.text();

      throw new Error(
        `Error al obtener alertas: ${response.status} - ${errorText}`
      );
    }


    // Intentar parsear la respuesta como JSON
    const apiAlerts: ApiAlert[] = await response.json();

    // Convertir los datos de la API al formato de la UI
    const alerts = mapApiAlertsToAlerts(apiAlerts);
    return alerts;
  } catch (error) {
    // Usar datos de ejemplo en caso de error
    throw error;
  }
}

// Función para obtener una alerta por ID
export async function fetchAlertById(id: number): Promise<AlertPage | null> {
  try {
    // Intentar obtener todas las alertas
    const response = await fetchWithAuth(`/alumnos/alertas/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("error en la petición");
    const alert = await response.json();

    if (!alert) {
      throw new Error(`No se encontró ninguna alerta con ID ${id}`);
    }
    if (Array.isArray(alert)) return alert[0];
    return alert;
  } catch (error) {
    throw error;
  }
}

export async function fetchRecentAlerts(): Promise<Alert[]> {
  try {
    const response = await fetchWithAuth("/alertas/recientes", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching recent alerts: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Marks an alert as read by its ID
 * @param alertId The ID of the alert to mark as read
 * @returns Promise that resolves to true if successful
 */
export async function changeLeida(alertId: string | number): Promise<boolean> {
  try {
    const response = await fetchWithAuth(
      `/alumnos/alertas/${alertId}?cambiar_lectura=true`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leida: true }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al actualizar el estado de la alerta");
    }

    return true;
  } catch (error) {
    throw error;
  }
}

//funcion para la data del chartLine de comparativo
export async function fetchTotalAlertsChartLine(): Promise<DataPoint[]> {
  try {
    const response = await fetchWithAuth("/comparativa/alerts/totales", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener alertas: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
export async function fetchTotalAlertsHistoricoChartLine(): Promise<
  DataPoint[]
> {
  try {
    const response = await fetchWithAuth("/comparativa/alerts/historial", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Error al obtener alertas: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export interface CreateAccionAlertParams {
  alumno_alerta_id: number;
  alumno_id: number;
  plan_accion: string;
  fecha_compromiso: string;
  fecha_realizacion: string;
  archivo?: string;
}

/**
 * Crea una nueva acción de alerta en la bitácora
 * @param data Datos de la acción a crear
 * @returns La acción creada
 */
export const createAccionAlert = async (data: CreateAccionAlertParams) => {
  try {
    const response = await fetchWithAuth("/alumnos/alertas_bitacoras", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        alumno_alerta_id: data.alumno_alerta_id,
        alumno_id: data.alumno_id,
        plan_accion: data.plan_accion,
        fecha_compromiso: data.fecha_compromiso,
        fecha_realizacion: data.fecha_realizacion,
        ...(data.archivo ? { url_archivo: data.archivo } : {}),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al crear la acción de alerta"
      );
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Interfaces para bitácora de alertas
export interface AlumnoAlertaBitacora {
  alumno_alerta_id: number;
  alumno_id: number;
  plan_accion: string; // OBLIGATORIO
  fecha_compromiso?: string;
  fecha_realizacion?: string;
  url_archivo?: string;
  alerta_prioridad_id: number;
  alerta_severidad_id: number;
  responsable_id: number;
  // observaciones?: string // ELIMINAR ESTA LÍNEA
}

export interface BitacoraResponse {
  alumno_alerta_bitacora_id: number;
  alumno_alerta_id: number;
  alumno_id: number;
  plan_accion: string;
  fecha_compromiso: string;
  fecha_realizacion: string | null;
  url_archivo: string | null;
  creado_por: number;
  actualizado_por: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  activo: boolean;
  alumno?: {
    alumno_id: number;
    nombre: string;
    curso_actual: string;
  };
  alerta?: {
    alumno_alerta_id: number;
    tipo_alerta: string;
    estado: string;
    severidad: string;
  };
}

export interface PowerUser {
  usuario_id: number;
  nombre_social: string;
  email: string;
  activo: boolean;
  actualizado_por: number;
  auth_id: string;
  clave_generada: string | null;
  creado_por: number;
  encripted_password: string;
  estado_usuario: string;
  fecha_actualizacion: string;
  fecha_creacion: string;
  idioma_id: number;
  intentos_inicio_sesion: number;
  persona_id: number;
  rol_id: number;
  telefono_contacto: string;
  ultimo_inicio_sesion: string;
  url_foto_perfil: string;

  idiomas: {
    idioma_id: number;
    nombre: string;
  };

  personas: {
    persona_id: number;
    nombres: string;
    apellidos: string;
  };

  roles: {
    rol_id: number;
    nombre: string;
  };
}
export interface AlertDetailResponse {
  alumno_alerta_id: number;
  alumno_id: number;
  alerta_regla_id: number;
  fecha_generada: string;
  fecha_resolucion: string | null;
  alerta_origen_id: number;
  prioridad_id: number;
  severidad_id: number;
  accion_tomada: string | null;
  leida: boolean;
  responsable_actual_id: number;
  estado: string;
  creado_por: number;
  actualizado_por: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  activo: boolean;
  alertas_tipo_alerta_tipo_id: number;
  alumnos: {
    personas: {
      nombres: string;
      apellidos: string;
      persona_id: number;
    };
    alumno_id: number;
    url_foto_perfil: string;
  };
  alertas_reglas: {
    nombre: string;
    alerta_regla_id: number;
  };
  alertas_origenes: {
    nombre: string;
    alerta_origen_id: number;
  };
  alertas_severidades: {
    nombre: string;
    alerta_severidad_id: number;
  };
  alertas_prioridades: {
    nombre: string;
    alerta_prioridad_id: number;
  };
  alertas_tipos: {
    nombre: string;
    alerta_tipo_id: number;
  };
}

// Obtener bitácoras de una alerta
export async function fetchAlertBitacoras(
  alertaId?: number
): Promise<BitacoraResponse[]> {
  let endpoint = "/alumnos/alertas_bitacoras";
  if (alertaId) {
    endpoint += `?alumno_alerta_id=${alertaId}`;
  }

  const response = await fetchApi(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al obtener bitácoras: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

// Obtener detalle de alerta
export async function fetchAlertDetail(
  alertaId: number
): Promise<AlertDetailResponse> {
  const response = await fetchWithAuth(`/alumnos/alertas/${alertaId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al obtener detalle de alerta: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();
  // El backend retorna un array, tomamos el primer elemento
  return Array.isArray(data) ? data[0] : data;
}

// Actualizar bitácora
export async function updateAlertBitacora(
  bitacoraId: number,
  bitacoraData: Partial<AlumnoAlertaBitacora>
): Promise<BitacoraResponse> {
  const response = await fetchWithAuth(
    `/alumnos/alertas_bitacoras/${bitacoraId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bitacoraData),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al actualizar bitácora: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

// Eliminar bitácora (soft delete - marca como inactivo)
export async function deleteAlertBitacora(bitacoraId: number): Promise<void> {
  const response = await fetchWithAuth(
    `/alumnos/alertas_bitacoras/${bitacoraId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error al eliminar bitácora: ${response.status} - ${errorText}`
    );
  }
}
export async function fetchSeverity(): Promise<ApiAlertSeverity[]> {
  try {
    // Realizar la solicitud GET a la API
    const response = await fetchWithAuth("/alertas/alertas_severidades", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Intentar leer el mensaje de error
      const errorText = await response.text();
      throw new Error(
        `Error al obtener alumnos: ${response.status} - ${errorText}`
      );
    }

    // Intentar parsear la respuesta como JSON
    const apiStudents = await response.json();

    // Transformar los datos de la API a nuestro modelo de Student
    return apiStudents;
  } catch (error) {
    throw error; // Propagar el error para que se maneje en el componente
  }
}
export async function fetchPrority(): Promise<ApiAlertPriority[]> {
  try {
    // Realizar la solicitud GET a la API
    const response = await fetchWithAuth("alertas/alertas_prioridades", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Intentar leer el mensaje de error
      const errorText = await response.text();
      throw new Error(
        `Error al obtener alumnos: ${response.status} - ${errorText}`
      );
    }

    // Intentar parsear la respuesta como JSON
    const apiStudents = await response.json();

    // Transformar los datos de la API a nuestro modelo de Student
    return apiStudents;
  } catch (error) {
    throw error; // Propagar el error para que se maneje en el componente
  }
}
export async function fetchStates(): Promise<AlertState[]> {
  try {
    const response = await fetchWithAuth("/alertas/alertas_estado", {
      method: "GET",
    });
    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Intentar leer el mensaje de error
      const errorText = await response.text();
      throw new Error(
        `Error al obtener alumnos: ${response.status} - ${errorText}`
      );
    }

    // Intentar parsear la respuesta como JSON
    const apiStudents = await response.json();

    // Transformar los datos de la API a nuestro modelo de Student
    return apiStudents;
  } catch (error) {
    throw error; // Propagar el error para que se maneje en el componente
  }
}

export interface AlertaTipo {
  alerta_tipo_id: number;
  nombre: string;
  creado_por: number;
  actualizado_por: number;
  fecha_creacion: string; // ISO date string
  fecha_actualizacion: string; // ISO date string
  activo: boolean;
  tiempo_resolucion: number;
  tiempo_atencion: number;
}

export async function fetchTypes(): Promise<AlertaTipo[]> {
  try {
    const response = await fetchWithAuth("/alertas/alertas_tipos", {
      method: "GET",
    });
    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Intentar leer el mensaje de error
      const errorText = await response.text();
      throw new Error(
        `Error al obtener alumnos: ${response.status} - ${errorText}`
      );
    }

    // Intentar parsear la respuesta como JSON
    const apiStudents = await response.json();

    // Transformar los datos de la API a nuestro modelo de Student
    return apiStudents;
  } catch (error) {
    throw error; // Propagar el error para que se maneje en el componente
  }
}

export async function fetchEquipoAlma(): Promise<Persona[]> {
  try {
    // Realizar la solicitud GET a la API
    const response = await fetchWithAuth("/personas?rol_id=3", {
      method: "GET",
    });
    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Intentar leer el mensaje de error
      const errorText = await response.text();
      throw new Error(
        `Error al obtener personas: ${response.status} - ${errorText}`
      );
    }

    // Intentar parsear la respuesta como JSON
    const apiStudents = await response.json();

    // Transformar los datos de la API a nuestro modelo de Student
    return apiStudents;
  } catch (error) {
    throw error; // Propagar el error para que se maneje en el componente
  }
}

export interface UpdateAlertParams {
  id: number;
  alumno_alerta_id: number;
  alumno_id: number;
  alerta_regla_id: number;
  prioridad_id: number;
  severidad_id: number;
  responsable_actual_id: string;
  estado: string;
  accion_tomada?: string;
  tipo_id?: string;
}

export interface UpdateBitacoraParams {
  alumno_alerta_id: number;
  alumno_id: number;
  plan_accion: string;
  fecha_compromiso: string;
  fecha_realizacion?: string;
  url_archivo?: string;
}

export async function updateAlert(alertData: AlertPage): Promise<ApiAlert> {
  try {
    const response = await fetchWithAuth(
      "alumnos/alertas/" + alertData.alumno_alerta_id,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leida: true,
          alerta_regla_id: 1,
          estado: alertData.estado,
          prioridad_id: alertData.prioridad_id,
          severidad_id: alertData.severidad_id,
          alumno_id: alertData.alumno.alumno_id,
          responsable_actual_id: parseInt(alertData.responsable_actual_id),
          alertas_prioridades: {
            alerta_prioridad_id: alertData.prioridad_id,
          },
          alertas_severidades: {
            alerta_severidad_id: alertData.severidad_id,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar la alerta");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function getPowerUsers(): Promise<PowerUser[]> {
  try {
    // Realizar la solicitud GET a la API
    const response = await fetchApi("/auth/usuarios/", {
      method: "GET",
    });
    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Intentar leer el mensaje de error
      const errorText = await response.text();
      throw new Error(
        `Error al obtener personas: ${response.status} - ${errorText}`
      );
    }

    // Intentar parsear la respuesta como JSON
    const apiStudents = await response.json();
    const filteredStudents = apiStudents.filter((student: PowerUser) =>
      [5, 6, 7].includes(student.rol_id)
    );

    // Transformar los datos de la API a nuestro modelo de Student
    return filteredStudents;
  } catch (error) {
    throw error; // Propagar el error para que se maneje en el componente
  }
}

export async function updateBitacora(
  bitacoraData: UpdateBitacoraParams
): Promise<any> {
  try {
    const response = await fetchWithAuth(
      `/alumnos/alertas_bitacoras/${bitacoraData.alumno_alerta_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bitacoraData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al actualizar la bitácora");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function updateAlertAndBitacora(
  alertData: AlertPage,
  bitacoraData: UpdateBitacoraParams
): Promise<[any, any]> {
  try {
    // Ejecutar ambas actualizaciones en paralelo
    const [alertResponse, bitacoraResponse] = await Promise.all([
      updateAlert(alertData),
      createAccionAlert(bitacoraData as CreateAccionAlertParams),
    ]);

    return [alertResponse, bitacoraResponse];
  } catch (error) {
    throw error;
  }
}

export interface CreateAlertParams {
  alumno_id: number;
  mensaje: string;
  fecha_generada: string;
  alerta_origen_id: number;
  prioridad_id: number;
  severidad_id: number;
  leida: boolean;
  estado: string;
  alertas_tipo_alerta_tipo_id: number;
  responsable_actual_id: number;
}

export async function createAlert(data: CreateAlertParams): Promise<void> {
  const generarFechaLocal = () => {
    const now = new Date();

    // Opción simple: usar toLocaleString con formato ISO
    return (
      now
        .toLocaleString("sv-SE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(" ", "T") + "Z"
    ); // Agregar 'T' y 'Z' si necesitas formato ISO
  };
  try {
    const response = await fetchApi("/alumnos/alertas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        alumno_id: data.alumno_id,
        mensaje: data.mensaje,
        fecha_generada: data.fecha_generada || generarFechaLocal(),
        alerta_origen_id: 4,
        prioridad_id: data.prioridad_id,
        severidad_id: data.severidad_id,
        leida: false,
        estado: data.estado,
        alertas_tipo_alerta_tipo_id: data.alertas_tipo_alerta_tipo_id,
        responsable_actual_id: data.responsable_actual_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al crear la alerta");
    }
  } catch (error) {
    throw error;
  }
}

export async function fetchBitacoraUsers(): Promise<PowerUser[]> {
  try {
    const response = await fetchWithAuth(
      "/auth/usuarios/bitacora",
      {},
      false // ¡Clave! Le decimos que NO añada el colegio_id
    );
    if (!response.ok) {
      console.error(
        "Error al obtener usuarios de bitácora:",
        await response.text()
      );
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error en fetchBitacoraUsers:", error);
    return [];
  }
}


export function parseAlertDateTime(dateString: string, timeString?: string): Date | null {
  if (!dateString) return null;
  const [day, month, year] = dateString.split("/").map(Number);
  if (
    !day ||
    !month ||
    !year ||
    year < 1900 ||
    year > 2100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    console.warn(
      `Fecha con formato inválido o año fuera de rango: ${dateString}`
    );
    return null;
  }
  let hours = 0,
    minutes = 0;
  if (timeString) {
    [hours, minutes] = timeString.split(":").map((t) => parseInt(t, 10) || 0);
  }
  // Construye fecha local (no UTC)
  return new Date(year, month - 1, day, hours, minutes);
};