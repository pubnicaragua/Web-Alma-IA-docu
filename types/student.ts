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
  url_foto_perfil: string;
  telefono_contacto1: string;
  telefono_contacto2: string;
  email: string;
  creado_por: number;
  actualizado_por: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  activo: boolean;
  persona_id: number;
  personas: {
    tipo_documento: string;
    numero_documento: string;
    generos: {
      nombre: string;
      genero_id: number;
    };
    nombres: string;
    apellidos: string;
    persona_id: number;
    fecha_nacimiento: Date | string | null;
  };
  colegios: {
    nombre: string;
    colegio_id: number;
  };
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
  }[];
}

export interface StudentMedicalRecord {
  alumno_ant_clinico_id: number;
  alumno_id: number;
  historial_medico: string;
  alergias: string;
  enfermedades_cronicas: string;
  condiciones_medicas_relevantes: string;
  medicamentos_actuales: string;
  diagnosticos_previos: string;
  terapias_tratamiento_curso: string;
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
  observaciones: string;
  estado_usuario: string;
  creado_por: Date;
  actualizado_por: Date;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  activo: boolean;
  apoderados: {
    personas: {
      nombres: string;
      apellidos: string;
      persona_id: number;
    };
    apoderado_id: number;
    email_contacto1: string;
    email_contacto2: string;
    telefono_contacto1: string;
    telefono_contacto2: string;
  };
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
