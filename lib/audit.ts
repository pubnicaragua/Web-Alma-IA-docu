export type StudentAuditSection = "alertas" | "informes" | "emociones";

export interface StudentTabAuditInput {
  alumnoId: number;
  colegioId: number;
  fecha?: string;
  section: StudentAuditSection;
  usuarioId: number;
}

export interface AuditPayload {
  tipo_auditoria_id: number;
  colegio_id: number;
  fecha: string;
  usuario_id: number;
  descripcion: string;
  modulo_afectado: string;
  accion_realizada: string;
  ip_origen: string;
  model: string;
  referencia_id: number;
}

export type AlertAuditAction =
  | "visualizar_imagen_alerta"
  | "reproducir_audio_alerta";

export interface AlertMediaAuditPayload {
  tipo_auditoria_id: number;
  colegio_id: number;
  fecha: string;
  usuario_id: number;
  descripcion: string;
  modulo_afectado: string;
  accion_realizada: AlertAuditAction;
  ip_origen: string;
  model: string;
  referencia_id: number;
}

export interface AlertMediaAuditInput {
  alertaId: number;
  colegioId: number;
  usuarioId: number;
  accion: AlertAuditAction;
}

/**
 * Genera el payload para la auditoría de pestañas de alumnos.
 * Nota: El valor 'ip_origen: "127.0.0.1"' es un marcador de posición (placeholder)
 * en el frontend y será reemplazado dinámicamente en el proxy de la API de Next.js
 * (app/api/proxy/[...path]/route.ts) con la dirección IP pública real del cliente.
 */
export function buildStudentTabAuditPayload({
  alumnoId,
  colegioId,
  fecha = new Date().toISOString(),
  section,
  usuarioId,
}: StudentTabAuditInput): AuditPayload {
  return {
    tipo_auditoria_id: 3,
    colegio_id: colegioId,
    fecha,
    usuario_id: usuarioId,
    descripcion: `Usuario consulto ${section} del alumno ${alumnoId}`,
    modulo_afectado: "alumnos",
    accion_realizada: `consultar_${section}`,
    ip_origen: "127.0.0.1", // Reemplazado dinámicamente por el proxy
    model: "alumnos",
    referencia_id: alumnoId,
  };
}

/**
 * Genera el payload para la auditoría de visualización/reproducción de recursos multimedia en alertas.
 * Nota: El valor 'ip_origen: "127.0.0.1"' es un marcador de posición (placeholder)
 * en el frontend y será reemplazado dinámicamente en el proxy de la API de Next.js
 * (app/api/proxy/[...path]/route.ts) con la dirección IP pública real del cliente.
 */
export function buildAlertMediaAuditPayload({
  alertaId,
  colegioId,
  usuarioId,
  accion,
}: AlertMediaAuditInput): AlertMediaAuditPayload {
  return {
    tipo_auditoria_id: 3,
    colegio_id: colegioId,
    fecha: new Date().toISOString(),
    usuario_id: usuarioId,
    descripcion: `Usuario ${accion.replace("_", " ")} de la alerta ${alertaId}`,
    modulo_afectado: "alertas",
    accion_realizada: accion,
    ip_origen: "127.0.0.1", // Reemplazado dinámicamente por el proxy
    model: "alertas",
    referencia_id: alertaId,
  };
}

export async function postAudit(payload: AuditPayload): Promise<void> {
  try {
    await window.axios.post("/auditoria", payload);
  } catch (error: any) {
    const detail = error?.response?.data
      ? ` - ${typeof error.response.data === "string" ? error.response.data : JSON.stringify(error.response.data)}`
      : "";
    throw new Error(`Error al guardar auditoria: ${error?.response?.status ?? "sin_status"}${detail}`);
  }
}
