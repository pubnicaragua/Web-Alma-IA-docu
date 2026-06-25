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
import { DatePicker } from "@/components/ui/date-picker";
import { useColoresCatalog } from "@/hooks/use-colores";

interface BarChartComparisonPatologieGeneralProps {
  title: string;
  onEmotionsLoaded?: (emotions: string[]) => void;
  initialData?: Emotion[];
  apiEmotions?: Array<{ nombre: string; valor: number }>;
}

const getDefaultActivePathologies = (emotions: Emotion[]) =>
  emotions.slice(0, 5).map((emotion) => emotion.name);

export function BarChartComparisonPatologieGeneral({
  title,
  onEmotionsLoaded,
  initialData,
  apiEmotions,
}: BarChartComparisonPatologieGeneralProps) {
  // Inicializar selectedEmotions con datos disponibles para evitar parpadeo
  const initialNames = initialData
    ? getDefaultActivePathologies(initialData)
    : apiEmotions
      ? apiEmotions.slice(0, 5).map((e) => e.nombre)
      : [];

  const [data, setData] = useState<Emotion[]>(initialData || []);
  const [selectedEmotions, setSelectedEmotions] =
    useState<string[]>(initialNames);
  const [isLoading, setIsLoading] = useState(!initialData && !apiEmotions);
  const [error, setError] = useState<string | null>(null);
  const [dateMode, setDateMode] = useState<"today" | "date">("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const { toast } = useToast();
  const { getColor } = useColoresCatalog();

  const dateFilterValue =
    dateMode === "today"
      ? "today"
      : selectedDate
        ? selectedDate.toISOString().slice(0, 10)
        : "today";

  const getPatologieColor = (emotionName: string): string =>
    getColor("patologias", emotionName, "#6c757d");

  const dataWithCatalogColor = data.map((emotion) => ({
    ...emotion,
    color: getPatologieColor(emotion.name),
  }));

  useEffect(() => {
    if (apiEmotions) {
      const transformedData = apiEmotions.map((emotion) => ({
        name: emotion.nombre,
        value: Math.round(emotion.valor / 100),
        cantidad_respuestas: Math.round(emotion.valor / 100),
        cantidad_negativas: 0,
        cantidad_neutras: 0,
        color: getPatologieColor(emotion.nombre),
      }));
      setData(transformedData);

      const names = getDefaultActivePathologies(transformedData);
      // Solo actualizar si cambian para evitar render extra
      if (
        names.length !== selectedEmotions.length ||
        !names.every((name) => selectedEmotions.includes(name))
      ) {
        setSelectedEmotions(names);
        if (onEmotionsLoaded) onEmotionsLoaded(names);
      }
    }
  }, [apiEmotions, selectedDate]);

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

      const normalizedData = emotionsData.map((emotion) => ({
        ...emotion,
        cantidad_respuestas: emotion.cantidad_respuestas ?? emotion.value,
        cantidad_negativas: emotion.cantidad_negativas ?? 0,
        cantidad_neutras: emotion.cantidad_neutras ?? 0,
      }));

      setData(normalizedData);

      const names = getDefaultActivePathologies(normalizedData);
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
    dataWithCatalogColor && dataWithCatalogColor.length > 0
      ? dataWithCatalogColor.filter((emotion) => selectedEmotions.includes(emotion.name))
      : [];

  const maxYAxisValue = Math.max(
    0.5,
    Math.ceil(Math.max(...filteredData.map((emotion) => emotion.value), 0) * 2) / 2
  );

  const yAxisTicks = Array.from(
    { length: Math.floor(maxYAxisValue / 0.5) + 1 },
    (_, index) => Number((index * 0.5).toFixed(1))
  );

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
                {dataWithCatalogColor.map((emotion) => (
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
                    <YAxis
                      domain={[0, maxYAxisValue]}
                      ticks={yAxisTicks}
                      tickFormatter={(value) => Number(value).toString()}
                    />
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (!active || !payload?.length) return null;

                        const item = payload[0].payload as Emotion;
                        const positiveResponses = Math.max(
                          (item.cantidad_respuestas ?? 0) -
                          (item.cantidad_negativas ?? 0) -
                          (item.cantidad_neutras ?? 0),
                          0
                        );

                        return (
                          <div className="rounded-lg border border-gray-100 bg-white p-3 text-sm shadow-md">
                            <p className="font-medium text-gray-800">{label}</p>
                            <p className="text-gray-600">
                              Valor:{" "}
                              <span className="font-medium">
                                {item.value}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Cantidad de respuestas:{" "}
                              <span className="font-medium">
                                {item.cantidad_respuestas ?? 0}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Negativas:{" "}
                              <span className="font-medium">
                                {item.cantidad_negativas ?? 0}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Neutras:{" "}
                              <span className="font-medium">
                                {item.cantidad_neutras ?? 0}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Positivas:{" "}
                              <span className="font-medium">
                                {positiveResponses}
                              </span>
                            </p>
                          </div>
                        );
                      }}
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

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}/${month}/${day}`;
}
