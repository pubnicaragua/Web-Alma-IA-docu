"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
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
import { Smile, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  fetchEmotions,
  fetchEmotionsByDate,
  type Emotion,
} from "@/services/home-service";
import { useToast } from "@/hooks/use-toast";
import { useColoresCatalog } from "@/hooks/use-colores";
import { DatePicker } from "@/components/ui/date-picker";

interface BarChartComparisonProps {
  title: string;
  selectedEmotions: string[];
  onToggleEmotion: (emotion: string) => void;
  setSelectedEmotions: Dispatch<SetStateAction<string[]>>;
  initialData?: Emotion[];
  apiEmotions?: Array<{
    nombre: string;
    valor: number;
  }>;
}

export function BarChartComparison({
  title,
  selectedEmotions,
  onToggleEmotion,
  setSelectedEmotions,
  initialData,
  apiEmotions,
}: BarChartComparisonProps) {
  const [data, setData] = useState<Emotion[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData && !apiEmotions);
  const [error, setError] = useState<string | null>(null);

  // Estado para controlar modo de filtro: "today" o "date"
  const [dateMode, setDateMode] = useState<"today" | "date">("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Valor final del filtro para usar en peticiones (formato YYYY/MM/DD)
  const dateFilterValue =
    dateMode === "today"
      ? "today"
      : selectedDate
      ? formatDateToYYYYMMDD(selectedDate)
      : "today";

  const { toast } = useToast();
  const { getColor } = useColoresCatalog();

  const colorOfEmotion = (emotionName: string): string =>
    getColor("emociones", emotionName, "#6c757d");

  const dataWithCatalogColor = data.map((item) => ({
    ...item,
    color: colorOfEmotion(item.name),
  }));

  useEffect(() => {
    if (!initialData && !apiEmotions) {
      loadData(dateFilterValue);
    } else if (apiEmotions) {
      const transformedData = apiEmotions.map((emotion) => ({
        name: emotion.nombre,
        value: Math.round(emotion.valor / 100),
        color: colorOfEmotion(emotion.nombre),
      }));
      setData(transformedData);

      // CORRECCIÓN: Actualizar selectedEmotions con los nombres reales del API
      const emotionNames = transformedData.map((emotion) => emotion.name);
      setSelectedEmotions(emotionNames);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, apiEmotions]);

  useEffect(() => {
    if (!initialData && !apiEmotions) {
      loadData(dateFilterValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilterValue]);

  const loadData = async (filter: string) => {
    try {
      setIsLoading(true);
      setError(null);

      let emotionsData: Emotion[];

      if (filter === "today") {
        emotionsData = await fetchEmotions();
      } else {
        emotionsData = await fetchEmotionsByDate(filter);
      }

      // CORRECCIÓN: Actualizar selectedEmotions con los nombres reales de la API
      const emotionNames = emotionsData.map((emotion) => emotion.name);
      setSelectedEmotions(emotionNames);

      setData(
        emotionsData.map((emotion) => ({
          ...emotion,
          color: colorOfEmotion(emotion.name),
        }))
      );
    } catch (err) {
      setError(
        "No se pudieron cargar los datos de emociones. Intente nuevamente."
      );

      toast({
        title: "Error al cargar datos",
        description:
          "No se pudieron cargar los datos de emociones. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData =
    dataWithCatalogColor && dataWithCatalogColor.length > 0
      ? dataWithCatalogColor.filter((emotion) =>
          selectedEmotions.includes(emotion.name)
        )
      : [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-blue-200 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-5 h-5 bg-gray-200 rounded-full mr-2"></div>
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
        <div className="h-64 w-full bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-red-200">
        <div className="flex items-center mb-4">
          <AlertCircle className="mr-2 text-red-500" />
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => loadData(dateFilterValue)}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-blue-200">
        <div className="flex items-center mb-4">
          <Smile className="mr-2 text-gray-700" />
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-500 text-center py-10">
          No hay datos de emociones disponibles.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-blue-200">
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

      <div className="flex flex-wrap gap-2 mb-4">
        {dataWithCatalogColor.map((emotion) => (
          <Badge
            key={emotion.name}
            variant={
              selectedEmotions.includes(emotion.name) ? "default" : "outline"
            }
            className={`cursor-pointer ${
              selectedEmotions.includes(emotion.name)
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
            onClick={() => onToggleEmotion(emotion.name)}
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
    </div>
  );
}

// Función para formatear fecha a YYYY/MM/DD
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
}


