export interface StudentEmotionSource {
  nombre: string;
  total?: number | null;
  positivos?: number | null;
  neutrales?: number | null;
  negativos?: number | null;
  color?: string | null;
  conotacion?: string | null;
}

export interface StudentEmotionChartItem {
  name: string;
  value: number;
  positivos: number;
  neutrales: number;
  negativos: number;
  color: string;
  connotation: EmotionGroupKey;
}

export interface StudentEmotionComparisonSource {
  nombre: string;
  cantidad_alumno?: number | null;
  proporcion_alumno?: number | null;
}

export interface StudentEmotionComparisonApiItem {
  emocion: string;
  conotacion?: string | null;
  color?: string | null;
  alumno?: number | null;
  promedio?: number | null;
  diferencia?: number | null;
}

export interface StudentEmotionComparisonApiResponse {
  alumno_id?: number | null;
  scope?: string | null;
  items?: StudentEmotionComparisonApiItem[] | null;
}

export interface StudentEmotionRadarItem {
  name: string;
  alumno: number;
  promedio: number;
  color: string;
  connotation: Exclude<EmotionGroupKey, "neutro">;
  diferencia?: number;
}

export type EmotionGroupKey = "positivo" | "negativo" | "neutro";

export interface StudentEmotionGroups {
  positivo: StudentEmotionChartItem[];
  negativo: StudentEmotionChartItem[];
  neutro: StudentEmotionChartItem[];
}

const FALLBACK_COLOR = "#6c757d";

function normalizeConnotation(value?: string | null): EmotionGroupKey | null {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) return null;
  if (normalized.startsWith("posit")) return "positivo";
  if (normalized.startsWith("negat")) return "negativo";
  if (normalized.startsWith("neutr")) return "neutro";

  return null;
}

function toChartItem(source: StudentEmotionSource): StudentEmotionChartItem | null {
  const connotation = normalizeConnotation(source.conotacion);

  if (!connotation) return null;

  const valueByConnotation =
    connotation === "positivo"
      ? source.positivos
      : connotation === "negativo"
        ? source.negativos
        : source.neutrales;

  return {
    name: source.nombre,
    value: Number(valueByConnotation ?? source.total ?? 0),
    positivos: Number(source.positivos ?? 0),
    neutrales: Number(source.neutrales ?? 0),
    negativos: Number(source.negativos ?? 0),
    color: source.color || FALLBACK_COLOR,
    connotation,
  };
}

export function buildEmotionGroups(
  emotions: StudentEmotionSource[] | null | undefined
): StudentEmotionGroups {
  const base: StudentEmotionGroups = {
    positivo: [],
    negativo: [],
    neutro: [],
  };

  for (const emotion of emotions ?? []) {
    const item = toChartItem(emotion);
    if (!item) continue;
    base[item.connotation].push(item);
  }

  for (const key of Object.keys(base) as EmotionGroupKey[]) {
    base[key].sort((left, right) => right.value - left.value);
  }

  return base;
}

export function buildRadarComparisonData(
  groups: StudentEmotionGroups,
  comparisonData: StudentEmotionComparisonSource[] | null | undefined
): StudentEmotionRadarItem[] {
  const lookup = new Map(
    (comparisonData ?? []).map((item) => [
      item.nombre,
      {
        alumno: Number(item.cantidad_alumno ?? 0),
        promedio: Number(item.proporcion_alumno ?? 0),
      },
    ])
  );

  const selected = [
    ...groups.positivo.slice(0, 2),
    ...groups.negativo.slice(0, 2),
  ];

  return selected.map((item) => {
    const current = lookup.get(item.name);

    return {
      name: item.name,
      alumno: current?.alumno ?? 0,
      promedio: current?.promedio ?? 0,
      color: item.color || FALLBACK_COLOR,
      connotation: item.connotation as "positivo" | "negativo",
    };
  });
}

export function buildComparisonEmotionNames(groups: StudentEmotionGroups): string[] {
  return [...groups.positivo.slice(0, 2), ...groups.negativo.slice(0, 2)].map(
    (item) => item.name
  );
}

export function buildRadarComparisonDataFromApi(
  response: StudentEmotionComparisonApiResponse | null | undefined
): StudentEmotionRadarItem[] {
  return (response?.items ?? []).reduce<StudentEmotionRadarItem[]>((acc, item) => {
      const connotation = normalizeConnotation(item.conotacion);

      if (!connotation || connotation === "neutro") {
        return acc;
      }

      acc.push({
        name: item.emocion,
        alumno: Number(item.alumno ?? 0),
        promedio: Number(item.promedio ?? 0),
        color: item.color || FALLBACK_COLOR,
        connotation,
        diferencia: Number(item.diferencia ?? 0),
      });

      return acc;
    }, []);
}

export function hasMeaningfulComparisonItems(
  items: StudentEmotionRadarItem[] | null | undefined
): boolean {
  return (items ?? []).some(
    (item) => Number(item.alumno ?? 0) > 0 || Number(item.promedio ?? 0) > 0
  );
}
