export interface StudentDiagnosticSource {
  nombre: string;
  total?: number | null;
  positivos?: number | null;
  neutrales?: number | null;
  negativos?: number | null;
  color?: string | null;
  cantidad_preguntas?: number | null;
}

export interface StudentDiagnosticItem {
  name: string;
  total: number;
  positivos: number;
  neutrales: number;
  negativos: number;
  color: string;
  cantidadPreguntas: number;
}

const FALLBACK_COLOR = "#94a3b8";

export function buildStudentDiagnosticItems(
  items: StudentDiagnosticSource[] | null | undefined,
  limit = 5
): StudentDiagnosticItem[] {
  return (items ?? []).slice(0, limit).map((item) => ({
    name: item.nombre,
    total: Number(item.total ?? 0),
    positivos: Number(item.positivos ?? 0),
    neutrales: Number(item.neutrales ?? 0),
    negativos: Number(item.negativos ?? 0),
    color: item.color || FALLBACK_COLOR,
    cantidadPreguntas: Number(item.cantidad_preguntas ?? 0),
  }));
}
