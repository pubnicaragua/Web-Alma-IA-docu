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
import { Smile, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { themeColors } from "@/lib/theme-colors";
import { DatePicker } from "@/components/ui/date-picker";
import { type Emotion } from "@/services/home-service";

interface BarChartComparisonBaseProps {
  title: string;
  initialSelectedEmotions?: string[];
  onEmotionsChange?: (emotions: string[]) => void;
  initialData?: Emotion[];
  apiEmotions?: Array<{
    nombre: string;
    valor: number;
  }>;
  fetchData: (filter: string) => Promise<Emotion[]>;
  getColor: (emotion: string) => string;
  defaultEmotions?: string[];
}

export function BarChartComparisonBase({
  title,
  initialSelectedEmotions = [],
  onEmotionsChange,
  initialData,
  apiEmotions,
  fetchData,
  getColor,
  defaultEmotions = [],
}: BarChartComparisonBaseProps) {
  const [data, setData] = useState<Emotion[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData && !apiEmotions);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    initialSelectedEmotions || defaultEmotions
  );
  const [dateMode, setDateMode] = useState<"today" | "date">("today");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  const dateFilterValue =
    dateMode === "today"
      ? "today"
      : selectedDate
      ? selectedDate.toISOString().slice(0, 10)
      : "today";

  useEffect(() => {
    if (!initialData && !apiEmotions) {
      loadData(dateFilterValue);
    } else if (apiEmotions) {
      const transformedData = apiEmotions.map((emotion) => ({
        name: emotion.nombre,
        value: Math.round(emotion.valor / 100),
        color: getColor(emotion.nombre),
      }));
      setData(transformedData);
      const apiEmotionNames = apiEmotions.map((e) => e.nombre);
      setSelectedEmotions(apiEmotionNames);
      if (onEmotionsChange) onEmotionsChange(apiEmotionNames);
    }
  }, [initialData, apiEmotions, selectedDate]);

  useEffect(() => {
    setSelectedEmotions(initialSelectedEmotions || defaultEmotions);
  }, [initialSelectedEmotions]);

  const loadData = async (filter: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const emotionsData = await fetchData(filter);
      setData(emotionsData);
    } catch (err) {
      setError("Error al cargar los datos");
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData(dateFilterValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
          />
        </div>
      </div>
      
      <div className="rounded-lg border p-4">
        {error && (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
}
