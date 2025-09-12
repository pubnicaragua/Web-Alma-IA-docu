"use client";

import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchImportantDates,
  type ImportantDate,
} from "@/services/home-service";
import { useToast } from "@/hooks/use-toast";
import { ImportantDatesSkeleton } from "./important-dates-skeleton";

interface ImportantDatesProps {
  title?: string;
  initialData?: ImportantDate[];
}

export function ImportantDates({
  title = "Fechas importantes",
  initialData,
}: ImportantDatesProps) {
  const [dates, setDates] = useState<ImportantDate[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!initialData) {
      loadDates();
    }
  }, [initialData]);

  const loadDates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchImportantDates();

        if (!data || !Array.isArray(data) || data.length === 0) {
          setDates([]);
        } else {
          setDates(data);
        }
      } catch (err) {
        setDates([]);

        toast({
          title: "Error al cargar datos",
          description:
            "No se pudieron cargar las fechas importantes desde el servidor.",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError(
        "No se pudieron cargar las fechas importantes. Intente nuevamente."
      );

      toast({
        title: "Error al cargar datos",
        description:
          "No se pudieron cargar las fechas importantes. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Función para truncar texto largo
  const truncateText = (text: string, maxLength = 60) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Renderizar esqueleto durante la carga
  if (isLoading) {
    return <ImportantDatesSkeleton />;
  }

  // Renderizar mensaje de error
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadDates}
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar mensaje si no hay fechas
  if (!dates || dates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-100 text-lg font-medium text-center py-6 px-4 rounded-md">
            No hay fechas importantes disponibles.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ordenar fechas por fecha (más recientes primero)
  const sortedDates = [...dates].sort((a, b) => {
    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
  });

  // Limitar a mostrar solo los 7 elementos más recientes
  const limitedDates = sortedDates.slice(0, 7);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-scroll max-h-[480px]">
        <div className="space-y-0">
          {limitedDates.map((date, index) => (
            <div key={date.calendario_fecha_importante_id || index}>
              <div className="py-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    {date.titulo}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(date.fecha)}
                  </span>
                </div>
                {date.descripcion && (
                  <div
                    className="text-sm text-gray-500 mt-1"
                    title={date.descripcion}
                  >
                    {truncateText(date.descripcion)}
                  </div>
                )}
              </div>
              {index < limitedDates.length - 1 && (
                <div className="border-t border-gray-100"></div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
