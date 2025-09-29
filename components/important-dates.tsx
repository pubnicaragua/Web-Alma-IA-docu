"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchImportantDates,
  type ImportantDate,
} from "@/services/home-service";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/use-pagination";
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

  const sortedDates = useMemo(() => {
    return dates.sort((a, b) => {
      return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    });
  }, [dates])

  const pagination = usePagination(sortedDates, 7);

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

  return (
    <>
      {isLoading ? (
        <ImportantDatesSkeleton />
      ) : error ? (
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
      ) : !dates || dates.length === 0 ? (
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
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {pagination.paginated.map((date, index) => (
                <div key={date.calendario_fecha_importante_id || index}>
                  <div className="py-2">
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
                </div>
              ))}
              {pagination.lastPage > 0 && (
                <div className="flex items-center space-x-2 pt-4 justify-end ">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={pagination.prev}
                    disabled={pagination.page === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Página {pagination.page + 1} de {pagination.lastPage + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={pagination.next}
                    disabled={pagination.page === pagination.lastPage}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );

}
