"use client";

import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smile, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchPatologieForGrade } from "@/services/home-service";
import { useColoresCatalog } from "@/hooks/use-colores";

interface EmotionData {
  name: string; // Ejemplo: "1Â° Medio A - Jornada MaÃ±ana"
  [emotion: string]: string | number; // Ejemplo: "Ansiedad": 3, "Felicidad": 2
}

interface BarChartComparisonPatologieProps {
  title: string;
  grado: number;
  courseName?: string | null;
}

export function BarChartComparisonPatologie({
  title,
  grado,
  courseName,
}: BarChartComparisonPatologieProps) {
  const [rawData, setRawData] = useState<EmotionData[]>([]);
  const [data, setData] = useState<EmotionData[]>([]);
  const [allEmotions, setAllEmotions] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { getColor } = useColoresCatalog();

  const getEmotionColor = (emotion: string): string =>
    getColor("patologias", emotion, "#6c757d");

  const currentRequest = useRef(0);

  const fetchGradoData = async (currentGrado: number) => {
    const requestId = ++currentRequest.current;
    try {
      setIsLoading(true);
      setError(null);
      const emotionsData = await fetchPatologieForGrade(currentGrado);
      if (requestId === currentRequest.current) {
        setRawData(emotionsData);
      }
    } catch (err) {
      if (requestId === currentRequest.current) {
        setError(
          "No se pudieron cargar los datos de patologias. Intente nuevamente."
        );
        toast({
          title: "Error al cargar datos",
          description:
            "No se pudieron cargar los datos de patologias. Intente nuevamente.",
          variant: "destructive",
        });
      }
    } finally {
      if (requestId === currentRequest.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (grado !== undefined) {
      fetchGradoData(grado);
    }
  }, [grado]);

  useEffect(() => {
    if (!rawData) return;

    const uniqueEmotions = new Set<string>();

    const filteredData = courseName
      ? rawData.filter((item) => item.name === courseName)
      : rawData;

    const normalizedData = filteredData.map((item) => {
      const { name, ...emotions } = item;
      Object.keys(emotions).forEach((emotion) => uniqueEmotions.add(emotion));
      return { name, ...emotions };
    });

    const completeData = normalizedData.map((item: any) => {
      const completeItem: EmotionData = { name: item.name };
      uniqueEmotions.forEach((emotion) => {
        completeItem[emotion] = item[emotion] ?? 0;
      });
      return completeItem;
    });

    const emotionsList = Array.from(uniqueEmotions);
    setData(completeData);
    setAllEmotions(emotionsList);
    
    setSelectedEmotions((prev) => {
      const prevSet = new Set(prev);
      const missing = emotionsList.filter(e => !prevSet.has(e));
      return missing.length > 0 ? [...prev, ...missing] : prev.filter(e => emotionsList.includes(e));
    });
  }, [rawData, courseName]);

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const selectAll = () => {
    setSelectedEmotions(allEmotions);
  };

  const deselectAll = () => {
    setSelectedEmotions([]);
  };

  const filteredEmotions = allEmotions.filter((emotion) =>
    emotion.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          onClick={() => fetchGradoData(grado)}
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
    <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-blue-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center mb-4">
          <Smile className="mr-2 text-gray-700" />
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>

        {/* Controles de Búsqueda y Selección Rápida */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-center gap-2">
            <input
              type="text"
              placeholder="Buscar patología..."
              className="px-3 py-1 text-sm border border-gray-200 rounded-md w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-7 border-blue-200 text-blue-600 hover:bg-blue-50"
                onClick={selectAll}
              >
                Todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-7 border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={deselectAll}
              >
                Ninguna
              </Button>
            </div>
          </div>

          {/* Listado Scrollable de Badges */}
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-gray-50/50 rounded-md border border-gray-100 scrollbar-thin">
            {filteredEmotions.length === 0 ? (
              <span className="text-xs text-gray-400 p-1">No se encontraron patologías.</span>
            ) : (
              filteredEmotions.map((emotion) => (
                <Badge
                  key={emotion}
                  variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedEmotions.includes(emotion)
                      ? ""
                      : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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
              ))
            )}
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#4b5563" }}
              tickFormatter={(value) =>
                value.length > 12 ? `${value.substring(0, 10)}...` : value
              }
            />
            <YAxis tick={{ fontSize: 11, fill: "#4b5563" }} />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              wrapperStyle={{ pointerEvents: 'auto', zIndex: 100 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const validPayload = payload
                    .filter((p) => Number(p.value) > 0)
                    .sort((a, b) => Number(b.value) - Number(a.value));
                  
                  if (validPayload.length === 0) return null;

                  return (
                    <div 
                      className="bg-white border border-gray-100 rounded-lg shadow-lg max-h-[400px] overflow-y-auto w-56 scrollbar-thin scrollbar-thumb-gray-200"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <p className="font-semibold text-gray-800 text-sm border-b p-3 sticky top-0 bg-white z-10 mb-2">
                        {label}
                      </p>
                      <div className="flex flex-col gap-1.5 px-3 pb-3">
                        {validPayload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                              <span className="text-gray-600 truncate">{entry.name}</span>
                            </div>
                            <span className="font-semibold text-gray-700 ml-2 shrink-0">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
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
