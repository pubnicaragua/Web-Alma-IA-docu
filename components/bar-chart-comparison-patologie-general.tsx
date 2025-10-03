"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { LoaderCircle, Smile, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  fetchPatologieGeneral,
  fetchPatologieByDate,
  type Emotion,
} from "@/services/home-service";
import { useToast } from "@/hooks/use-toast";
import { themeColors } from "@/lib/theme-colors";
import { DatePicker } from "@/components/ui/date-picker";

interface BarChartComparisonPatologieGeneralProps {
  title: string;
  onEmotionsLoaded?: (emotions: string[]) => void;
  initialData?: Emotion[];
  apiEmotions?: Array<{ nombre: string; valor: number }>;
}

export function BarChartComparisonPatologieGeneral({
  title,
  onEmotionsLoaded,
  initialData,
  apiEmotions,
}: BarChartComparisonPatologieGeneralProps) {
  // Inicializar selectedEmotions con datos disponibles para evitar parpadeo
  const initialNames = initialData
    ? initialData.map((e) => e.name)
    : apiEmotions
      ? apiEmotions.map((e) => e.nombre)
      : [];

  const [data, setData] = useState<Emotion[]>(initialData || []);
  const [selectedEmotions, setSelectedEmotions] =
    useState<string[]>(initialNames);
  const [isLoading, setIsLoading] = useState(!initialData && !apiEmotions);
  const [error, setError] = useState<string | null>(null);
  const [dateMode, setDateMode] = useState<"today" | "date">("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const { toast } = useToast();

  const dateFilterValue =
    dateMode === "today"
      ? "today"
      : selectedDate
        ? selectedDate.toISOString().slice(0, 10)
        : "today";

  function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}/${month}/${day}`;
  }

  useEffect(() => {
    if (!initialData && !apiEmotions) {
      loadData(dateFilterValue);
    } else if (apiEmotions) {
      const transformedData = apiEmotions.map((emotion) => ({
        name: emotion.nombre,
        value: Math.round(emotion.valor / 100),
        color: getPatologieColor(emotion.nombre),
      }));
      setData(transformedData);

      const names = transformedData.map((e) => e.name);
      // Solo actualizar si cambian para evitar render extra
      if (
        names.length !== selectedEmotions.length ||
        !names.every((name) => selectedEmotions.includes(name))
      ) {
        setSelectedEmotions(names);
        if (onEmotionsLoaded) onEmotionsLoaded(names);
      }
    }
  }, [initialData, apiEmotions, selectedDate]);

  useEffect(() => {
    if (!initialData && !apiEmotions) {
      loadData(dateFilterValue);
    }
  }, [dateFilterValue, selectedDate]);

  const loadData = async (filter: string) => {
    try {
      setIsLoading(true);
      setError(null);

      let emotionsData: Emotion[];

      if (filter === "today") {
        emotionsData = await fetchPatologieGeneral();
      } else {
        emotionsData = await fetchPatologieByDate(
          formatDateToYYYYMMDD(selectedDate!)
        );
      }

      setData(emotionsData);

      const names = emotionsData.map((e) => e.name);
      if (
        names.length !== selectedEmotions.length ||
        !names.every((name) => selectedEmotions.includes(name))
      ) {
        setSelectedEmotions(names);
        if (onEmotionsLoaded) onEmotionsLoaded(names);
      }
    } catch (err) {
      setError(
        "No se pudieron cargar los datos de patologías. Intente nuevamente."
      );
      toast({
        title: "Error al cargar datos",
        description:
          "No se pudieron cargar los datos de patologías. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEmotion = (emotion: string) => {
    const newEmotions = selectedEmotions.includes(emotion)
      ? selectedEmotions.filter((e) => e !== emotion)
      : [...selectedEmotions, emotion];
    setSelectedEmotions(newEmotions);
    if (onEmotionsLoaded) onEmotionsLoaded(newEmotions);
  };

  const filteredData =
    data && data.length > 0
      ? data.filter((emotion) => selectedEmotions.includes(emotion.name))
      : [];


  return (
    <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-blue-200">

      {/* Nombre del grafico y filtro */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <Smile className="mr-2 text-gray-700" />
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-right text-gray-700" htmlFor="">
            Datos al:
          </label>
          {dateMode === "date" && (
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              maxDate={new Date()}
              placeholderText="Seleccione una fecha"
              className="w-40 p-2 rounded-md text-center"
            />
          )}
        </div>
      </div>

      {/* Grafico */}
      {(isLoading) ? (
        <div className="p-4 animate-pulse text-center">
          <LoaderCircle className="animate-spin inline" />
          <p>Cargando datos...</p>
        </div>
      ) : (
        <>
          {(error) && (
            <p className="p-4 text-sm text-red-800 text-center rounded-lg bg-red-50">
              {error}
            </p>
          )}

          {(!data || !data.length) && (
            <div className="p-4 text-sm text-red-800 text-center rounded-lg bg-red-50">
              <TriangleAlert className="inline" />
              <p>No hay datos disponibles</p>
            </div>
          )}

          {data && Boolean(data.length) && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {data.map((emotion) => (
                  <Badge
                    key={emotion.name}
                    variant={
                      selectedEmotions.includes(emotion.name) ? "default" : "outline"
                    }
                    className={`cursor-pointer ${selectedEmotions.includes(emotion.name)
                      ? ""
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                      }`}
                    style={{
                      backgroundColor: selectedEmotions.includes(emotion.name)
                        ? emotion.color
                        : "",
                      borderColor: emotion.color,
                      color: selectedEmotions.includes(emotion.name) ? "white" : "",
                    }}
                    onClick={() => handleToggleEmotion(emotion.name)}
                  >
                    {emotion.name}
                  </Badge>
                ))}
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                    maxBarSize={50}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        value.length > 6 ? `${value.substring(0, 6)}...` : value
                      }
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value}`, "Cantidad"]}
                      labelFormatter={(name) => `${name}`}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {filteredData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function getPatologieColor(emotion: string): string {
  const colors: Record<string, string> = {
    Felicidad: themeColors.chart.yellow,
    Tristeza: themeColors.chart.blue,
    Estrés: themeColors.chart.gray,
    Ansiedad: themeColors.chart.orange,
    Enojo: themeColors.chart.red,
    Otros: themeColors.chart.purple,
  };
  return colors[emotion] || themeColors.chart.gray;
}
