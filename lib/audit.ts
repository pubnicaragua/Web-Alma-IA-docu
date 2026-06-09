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
    ip_origen: "127.0.0.1",
    model: "alumnos",
    referencia_id: alumnoId,
  };
}

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
    ip_origen: "127.0.0.1",
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
