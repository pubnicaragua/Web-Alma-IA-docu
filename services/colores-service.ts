import { fetchWithAuth } from "@/lib/api-config";

export interface CatalogColor {
  categoria: string;
  subcategoria: string;
  codigo: string;
  hex: string;
  color_hex: string;
}

export type ColorCategory = "emociones" | "patologias" | "neurodivergencias";

export interface ColorPalette {
  emociones: Record<string, string>;
  patologias: Record<string, string>;
  neurodivergencias: Record<string, string>;
}

const normalizeColorKey = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const normalizeValue = (value: string): string =>
  value.trim().toLowerCase();

const toIndexedMap = (entries: Record<string, string>): Record<string, string> => {
  const map: Record<string, string> = {};
  Object.entries(entries).forEach(([name, color]) => {
    if (!name || !color) return;
    map[name] = color;
    map[normalizeValue(name)] = color;
    map[normalizeColorKey(name)] = color;
  });
  return map;
};

export const FALLBACK_PALETTE: ColorPalette = {
  emociones: {},
  patologias: {},
  neurodivergencias: {},
};

const toPaletteMap = (items: CatalogColor[] = []): Record<string, string> => {
  const map: Record<string, string> = {};

  items.forEach((item) => {
    const label = (item.subcategoria || item.codigo || "").trim();
    const color = (item.color_hex || item.hex || "").trim();

    if (!label || !color) return;

    map[label] = color;
    map[normalizeValue(label)] = color;
    map[normalizeColorKey(label)] = color;

    if (item.codigo) {
      const codigo = item.codigo.trim();
      if (codigo) {
        map[codigo] = color;
        map[normalizeValue(codigo)] = color;
        map[normalizeColorKey(codigo)] = color;
      }
    }
  });

  return map;
};

const toGroupedResponse = (raw: unknown): Record<ColorCategory, CatalogColor[]> => {
  const safeRaw = (raw as Record<string, unknown>) || {};

  if (Array.isArray(raw)) {
    const grouped: Record<ColorCategory, CatalogColor[]> = {
      emociones: [],
      patologias: [],
      neurodivergencias: [],
    };

    (raw as CatalogColor[]).forEach((item) => {
      const categoria = String((item as CatalogColor).categoria || "").toLowerCase();
      const target =
        categoria.includes("patolog") || categoria.includes("patologia")
          ? "patologias"
          : categoria.includes("neuro")
            ? "neurodivergencias"
            : "emociones";
      grouped[target].push(item);
    });

    return grouped;
  }

  return {
    emociones: Array.isArray(safeRaw["emociones"])
      ? (safeRaw["emociones"] as CatalogColor[])
      : [],
    patologias: Array.isArray(safeRaw["patologias"])
      ? (safeRaw["patologias"] as CatalogColor[])
      : [],
    neurodivergencias: Array.isArray(safeRaw["neurodivergencias"])
      ? (safeRaw["neurodivergencias"] as CatalogColor[])
      : [],
  };
};

let catalogColors: ColorPalette | null = null;
let catalogFetchPromise: Promise<ColorPalette> | null = null;

const buildPalette = (raw: unknown): ColorPalette => {
  const grouped = toGroupedResponse(raw);

  return {
    emociones: toIndexedMap(toPaletteMap(grouped.emociones)),
    patologias: toIndexedMap(toPaletteMap(grouped.patologias)),
    neurodivergencias: toIndexedMap(toPaletteMap(grouped.neurodivergencias)),
  };
};

export const fetchColoresCatalog = async (force = false): Promise<ColorPalette> => {
  if (!force && catalogColors) return catalogColors;
  if (!force && catalogFetchPromise) return catalogFetchPromise;

  catalogFetchPromise = fetchWithAuth(
    "/colores?grouped=true",
    {
      method: "GET",
    },
    false
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("No se pudo obtener el catalogo de colores");
      }

      const data = await response.json();
      catalogColors = buildPalette(data);
      return catalogColors;
    })
    .catch((error) => {
      console.warn("[colores-service] Usando catalogo de fallback", error);
      return catalogColors || FALLBACK_PALETTE;
    })
    .finally(() => {
      catalogFetchPromise = null;
    });

  return catalogFetchPromise;
};

export const getPaletteColor = (
  palette: ColorPalette,
  category: ColorCategory,
  name: string,
  fallback: string
): string => {
  const categoryMap = palette[category] || {};
  return (
    categoryMap[name] ??
    categoryMap[normalizeValue(name)] ??
    categoryMap[normalizeColorKey(name)] ??
    fallback
  );
};

export const resetColoresCatalogCache = () => {
  catalogColors = null;
  catalogFetchPromise = null;
};
