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
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Smile, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchEmotionsForGrade,
  fetchPatologieForGrade,
} from "@/services/home-service";
import { useColoresCatalog } from "@/hooks/use-colores";

interface EmotionData {
  name: string; // Ejemplo: "1Â° Medio A - Jornada MaÃ±ana"
  [emotion: string]: string | number; // Ejemplo: "Ansiedad": 3, "Felicidad": 2
}

interface BarChartComparisonPatologieProps {
  title: string;
  grado: number;
}

export function BarChartComparisonPatologie({
  title,
  grado,
}: BarChartComparisonPatologieProps) {
  const [data, setData] = useState<EmotionData[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { getColor } = useColoresCatalog();

  useEffect(() => {
    loadData();
  }, [grado]);

  const getEmotionColor = (emotion: string): string =>
    getColor("patologias", emotion, "#6c757d");

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const emotionsData = await fetchPatologieForGrade(grado);
      const allEmotions = new Set<string>();

      // Normalizar datos y recopilar todas las patologías
      const normalizedData = emotionsData.map((item) => {
        const { name, ...emotions } = item;
        Object.keys(emotions).forEach((emotion) => allEmotions.add(emotion));
        return { name, ...emotions };
      });

      // Asegurar que cada entrada tenga todas las patologias con valor 0 si faltan
      const completeData = normalizedData.map((item) => {
        const completeItem: EmotionData = { name: item.name };
        allEmotions.forEach((emotion) => {
          completeItem[emotion] = item[emotion] ?? 0;
        });
        return completeItem;
      });

      setData(completeData);
      setSelectedEmotions(Array.from(allEmotions));
    } catch (err) {
      setError(
        "No se pudieron cargar los datos de patologias. Intente nuevamente."
      );
      toast({
        title: "Error al cargar datos",
        description:
          "No se pudieron cargar los datos de patologias. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

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
          onClick={loadData}
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
          No hay datos de patologias disponibles.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-blue-200">
      <div className="flex items-center mb-4">
        <Smile className="mr-2 text-gray-700" />
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from(new Set(selectedEmotions)).map((emotion) => (
          <Badge
            key={emotion}
            variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
            className={`cursor-pointer ${
              selectedEmotions.includes(emotion)
                ? ""
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            }`}
            style={{
              backgroundColor: selectedEmotions.includes(emotion)
                ? getEmotionColor(emotion)
                : "",
              borderColor: getEmotionColor(emotion),
              color: selectedEmotions.includes(emotion) ? "white" : "",
            }}
            onClick={() => toggleEmotion(emotion)}
          >
            {emotion}
          </Badge>
        ))}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
            barCategoryGap={20}
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
              formatter={(value: number, name: string) => [`${value}`, name]}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />
            <Legend />
            {selectedEmotions.map((emotion) => (
              <Bar
                key={emotion}
                dataKey={emotion}
                name={emotion}
                fill={getEmotionColor(emotion)}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
