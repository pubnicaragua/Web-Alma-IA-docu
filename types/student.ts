export interface Student {
  id: number
  nombres: string
  apellidos: string
  codigo_estudiante?: string
  fecha_nacimiento?: string
  genero?: string
  direccion?: string
  telefono?: string
  correo_electronico?: string
  grado?: string
  seccion?: string
  estado?: string
  url_foto_perfil?: string
  createdAt?: string
  updatedAt?: string
  // Agrega más campos según sea necesario
}

export interface StudentGeneral {
  alumno_id: number;
  colegio_id: number;
  url_foto_perfil: string | null;
  telefono_contacto1: string | null;
  telefono_contacto2: string | null;
  email: string | null;
  creado_por: number;
  actualizado_por: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  activo: boolean;
  persona_id: number;
  personas: {
    tipo_documento: string | null;
    numero_documento: string | null;
    generos: {
      nombre: string;
      genero_id: number;
    } | null;
    nombres: string | null;
    apellidos: string | null;
    persona_id: number;
    fecha_nacimiento: Date | string | null;
  } | null;
  colegios: {
    nombre: string;
    colegio_id: number;
  } | null;
  cursos: {
    curso_id: number;
    grados: {
      nombre: string;
      grado_id: number;
    };
    niveles_educativos: {
      nomber: string;
      nivel_educativo_id: number;
    };
  }[] | null;
}

export interface StudentMedicalRecord {
  alumno_ant_clinico_id: number;
  alumno_id: number;
  historial_medico: string | null;
  alergias: string | null;
  enfermedades_cronicas: string | null;
  condiciones_medicas_relevantes: string | null;
  medicamentos_actuales: string | null;
  diagnosticos_previos: string | null;
  terapias_tratamiento_curso: string | null;
  creado_por: number;
  actualizado_por: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  activo: boolean;
}

export interface StudentAlert {
  alumno_alerta_id: number;
  alumno_id: number;
  alerta_regla_id: number;
  fecha_generada: string;
  fecha_resolucion: string | null;
  alerta_origen_id: number;
  prioridad_id: number;
  severidad_id: number;
  accion_tomada: string;
  leida: boolean;
  activo: boolean;
  responsable_actual_id: number;
  estado: string;
  alertas_tipo_alerta_tipo_id: number;
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
  persona_responsable_actual: {
    nombres: string;
    apellidos: string;
    persona_id: number;
  };
}

export interface StudentRepresentative {
  alumno_apoderado_id: number;
  alumno_id: number;
  apoderado_id: number;
  tipo_apoderado: string;
  observaciones: string | null;
  estado_usuario: string | null;
  creado_por: Date;
  actualizado_por: Date;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  activo: boolean;
  apoderados: {
    personas: {
      nombres: string | null;
      apellidos: string | null;
      persona_id: number;
    } | null;
    apoderado_id: number;
    email_contacto1: string;
    email_contacto2: string;
    telefono_contacto1: string;
    telefono_contacto2: string;
  } | null;
}


export interface StudentReport {
  alumno_informe_id: number;
  alumno_id: number;
  fecha: string;
  url_reporte: string;
  creado_por: number;
  actualizado_por: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  activo: boolean;
  tipo_informe: string;
}

export interface AlertItemFormatted {
  alumno_alerta_id: number;
  fecha: string; // formato "DD/MM/YYYY"
  hora: string; // formato "HH:mm"
  tipo: string;
  estado: string;
  prioridad: string;
  responsable: string | null;
  severidad_name: string;
}
