"use client"

import { useCallback, useEffect, useState } from "react";
import {
  fetchColoresCatalog,
  FALLBACK_PALETTE,
  getPaletteColor,
  type ColorCategory,
  type ColorPalette,
} from "@/services/colores-service";
import { subscribeToAuthChanges } from "@/lib/auth-events";

interface UseColoresCatalogResult {
  loading: boolean;
  colors: ColorPalette;
  error: string | null;
  getColor: (category: ColorCategory, name: string, fallback?: string) => string;
  refresh: () => Promise<void>;
}

export function useColoresCatalog(): UseColoresCatalogResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorPalette>(FALLBACK_PALETTE);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const catalog = await fetchColoresCatalog(true);
      setColors(catalog);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el catálogo de colores";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const catalog = await fetchColoresCatalog();
        if (mounted) {
          setColors(catalog);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo cargar el catálogo de colores";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((authenticated) => {
      if (authenticated) {
        void reload();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [reload]);

  const getColor = useCallback(
    (category: ColorCategory, name: string, fallback: string = "#6c757d") =>
      getPaletteColor(colors, category, name, fallback),
    [colors]
  );

  return { loading, colors, error, getColor, refresh: reload };
}
