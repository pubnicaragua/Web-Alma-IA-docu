import assert from "node:assert/strict";

const { buildStudentTabAuditPayload } = await import("../lib/audit.ts");

const payload = buildStudentTabAuditPayload({
  alumnoId: 713,
  colegioId: 2,
  fecha: "2026-06-02T03:00:00.000Z",
  section: "alertas",
  usuarioId: 4210,
});

assert.deepEqual(payload, {
  tipo_auditoria_id: 3,
  colegio_id: 2,
  fecha: "2026-06-02T03:00:00.000Z",
  usuario_id: 4210,
  descripcion: "Usuario consulto alertas del alumno 713",
  modulo_afectado: "alumnos",
  accion_realizada: "consultar_alertas",
  ip_origen: "127.0.0.1",
  model: "alumnos",
  referencia_id: 713,
});
