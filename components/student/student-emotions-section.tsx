"use client";

import { useMemo, useState, type ComponentType } from "react";
import {
  AlertCircle,
  Brain,
  CalendarRange,
  Frown,
  HeartPulse,
  Meh,
  Smile,
  Sparkles,
} from "lucide-react";
import { useAxios } from "@/hooks/use-axios";
import { BarEmotionChart } from "@/components/dashboard/emotions/bar-chart";
import { DatePicker } from "@/components/ui/date-picker";
import {
  buildComparisonEmotionNames,
  buildRadarComparisonDataFromApi,
  hasMeaningfulComparisonItems,
  type StudentEmotionChartItem,
  type StudentEmotionComparisonApiResponse,
  type StudentEmotionGroups,
  type StudentEmotionSource,
} from "@/lib/student-emotions";
import {
  buildStudentDiagnosticItems,
  type StudentDiagnosticItem,
  type StudentDiagnosticSource,
} from "@/lib/student-diagnostic-top";

type EmotionTypeParam = "positivo" | "negativo" | "neutro";

interface StudentEmotionsSectionProps {
  studentId: string;
  schoolId?: number;
}

interface EmotionBarCardProps {
  title: string;
  icon: ComponentType<{ className?: string }>;
  data: StudentEmotionChartItem[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
}

interface EmotionRadarCardProps {
  data: ReturnType<typeof buildRadarComparisonDataFromApi>;
  loading: boolean;
  error: string | null;
  hasSelection: boolean;
}

interface DiagnosticSectionCardProps {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: StudentDiagnosticItem[];
  loading: boolean;
  error: string | null;
}

const FALLBACK_COLOR = "#6c757d";

function formatDateForApi(date: Date) {
  return date.toISOString().split("T")[0];
}

function getDefaultRange() {
  const end = new Date();
  const start = new Date(end.getFullYear() - 1, end.getMonth(), 1);

  return { start, end };
}

function EmotionBarCard({
  title,
  icon: Icon,
  data,
  loading,
  error,
  emptyMessage,
}: EmotionBarCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-blue-200">
      <div className="flex items-center mb-4">
        <Icon className="mr-2 text-gray-700" />
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-gray-100" />
          <div className="h-64 w-full rounded bg-gray-100" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-10 text-center text-sm text-red-700">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center text-sm text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <BarEmotionChart
            data={data.map((item) => ({
              nombre: item.name,
              positivos: item.positivos,
              neutrales: item.neutrales,
              negativos: item.negativos,
              color: item.color || FALLBACK_COLOR,
              conotacion: item.connotation,
              total: item.value,
              cantidad_preguntas: item.value,
            }))}
          />
        </div>
      )}
    </div>
  );
}

function EmotionRadarCard({
  data,
  loading,
  error,
  hasSelection,
}: EmotionRadarCardProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const tooltipFontSize = 11;
  const center = { x: 300, y: 300 };
  const maxRadius = 135;
  const maxValue = Math.max(...data.map((item) => Math.max(item.alumno, item.promedio)), 2);
  const angleStep = 360 / Math.max(data.length, 1);

  const valueToCoordinates = (value: number, angleIndex: number) => {
    const angle = angleIndex * angleStep;
    const radius = (value / maxValue) * maxRadius;
    const radian = (angle * Math.PI) / 180;

    return {
      x: center.x + radius * Math.sin(radian),
      y: center.y - radius * Math.cos(radian),
    };
  };

  const buildPolygonPoints = (kind: "alumno" | "promedio") =>
    data
      .map((item, index) =>
        valueToCoordinates(kind === "alumno" ? item.alumno : item.promedio, index)
      )
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

  const labels = data.map((item, index) => {
    const angle = index * angleStep;
    const radian = (angle * Math.PI) / 180;
    const anchor: "middle" | "start" | "end" =
      angle === 0
        ? "middle"
        : angle < 180
          ? "start"
          : angle === 180
            ? "middle"
            : "end";

    return {
      ...item,
      x: center.x + (maxRadius + 60) * Math.sin(radian),
      y: center.y - (maxRadius + 50) * Math.cos(radian),
      anchor,
    };
  }) as Array<(typeof data)[number] & { x: number; y: number; anchor: "middle" | "start" | "end" }>;

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-blue-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="mr-2 text-gray-700" />
          <h3 className="font-medium text-gray-800">Comparativa</h3>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
            Alumno
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-400 mr-2" />
            Promedio
          </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-gray-100" />
          <div className="h-[320px] w-full rounded bg-gray-100" />
        </div>
      ) : error ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-red-100 bg-red-50 px-6 text-center text-sm text-red-700">
          {error}
        </div>
      ) : !hasSelection || !hasMeaningfulComparisonItems(data) ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center text-sm text-gray-500">
          No hay datos suficientes para esta comparación.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg border border-gray-100">
            <svg viewBox="0 0 600 600" width="100%" height="100%" className="min-h-[350px] bg-white overflow-visible">
              <defs>
                <linearGradient id="alumnoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <filter id="radarShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
                </filter>
                <filter id="textBg" x="-15%" y="-25%" width="130%" height="150%">
                  <feFlood floodColor="#f1f5f9" floodOpacity="1" result="bg" />
                  <feMerge>
                    <feMergeNode in="bg" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {[0.25, 0.5, 0.75, 1].map((scale) => (
                <circle
                  key={scale}
                  cx={center.x}
                  cy={center.y}
                  r={scale * maxRadius}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}

              {data.map((_, index) => {
                const angle = index * angleStep;
                const radian = (angle * Math.PI) / 180;

                return (
                  <line
                    key={index}
                    x1={center.x}
                    y1={center.y}
                    x2={center.x + maxRadius * Math.sin(radian)}
                    y2={center.y - maxRadius * Math.cos(radian)}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                );
              })}

              {[0.5, 1, 1.5, 2].filter((value) => value <= maxValue).map((value) => (
                <text
                  key={value}
                  x={center.x + 10}
                  y={center.y - (value / maxValue) * maxRadius}
                  textAnchor="middle"
                  fontSize={tooltipFontSize}
                  fill="#9ca3af"
                >
                  {value.toFixed(1)}
                </text>
              ))}

              <polygon
                points={buildPolygonPoints("promedio")}
                fill="rgba(156, 163, 175, 0.15)"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeDasharray="5,3"
              />

              <polygon
                points={buildPolygonPoints("alumno")}
                fill="url(#alumnoGradient)"
                stroke="#3b82f6"
                strokeWidth="2.5"
                filter="url(#radarShadow)"
              />

              {data.map((item, index) => {
                const alumnoPoint = valueToCoordinates(item.alumno, index);
                const promedioPoint = valueToCoordinates(item.promedio, index);
                const isHovered = hoveredItem === item.name;

                return (
                  <g 
                    key={item.name}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    <circle
                      cx={promedioPoint.x}
                      cy={promedioPoint.y}
                      r={isHovered ? "8" : "4"}
                      fill={isHovered ? "#9ca3af" : "white"}
                      stroke="#9ca3af"
                      strokeWidth={isHovered ? "3" : "2"}
                    >
                      <title>{item.name} (Promedio): {item.promedio.toFixed(1)}</title>
                    </circle>
                    <circle
                      cx={alumnoPoint.x}
                      cy={alumnoPoint.y}
                      r={isHovered ? "10" : "5"}
                      fill={isHovered ? "#3b82f6" : "white"}
                      stroke="#3b82f6"
                      strokeWidth={isHovered ? "4" : "2"}
                    >
                      <title>{item.name} (Alumno): {item.alumno.toFixed(1)}</title>
                    </circle>
                  </g>
                );
              })}

              {labels.map((label) => {
                const isHovered = hoveredItem === label.name;
                return (
                <text
                  key={label.name}
                  x={label.x}
                  y={label.y}
                  textAnchor={label.anchor as "start" | "middle" | "end"}
                  fontSize={isHovered ? "14" : "12"}
                  fontWeight={isHovered ? "700" : "600"}
                  fill={label.color || FALLBACK_COLOR}
                  filter={isHovered ? "url(#textBg)" : "none"}
                  onMouseEnter={() => setHoveredItem(label.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ transform: isHovered ? "scale(1.1)" : "scale(1)", transformOrigin: `${label.x}px ${label.y}px` }}
                >
                  {label.name}
                </text>
                );
              })}
            </svg>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="py-2 pr-3">Emoción</th>
                  <th className="py-2 px-3 text-center">Alumno</th>
                  <th className="py-2 px-3 text-center">Promedio</th>
                  <th className="py-2 pl-3 text-center">Dif.</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const diff = item.alumno - item.promedio;
                  const diffClass =
                    diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-500";
                  const isHovered = hoveredItem === item.name;

                  return (
                    <tr 
                      key={item.name} 
                      className={`border-b border-gray-50 transition-colors duration-200 ${isHovered ? "bg-blue-100 shadow-sm" : ""}`}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color || FALLBACK_COLOR }}
                          />
                          <span className="font-medium text-gray-700">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-blue-500">
                        {item.alumno.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-500">
                        {item.promedio.toFixed(1)}
                      </td>
                      <td className={`py-3 pl-3 text-center font-medium ${diffClass}`}>
                        {diff > 0 ? "+" : ""}
                        {diff.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DiagnosticSectionCard({
  title,
  icon: Icon,
  items,
  loading,
  error,
}: DiagnosticSectionCardProps) {
  const chartData = items.map((item) => ({
    nombre: item.name,
    positivos: item.positivos,
    neutrales: item.neutrales,
    negativos: item.negativos,
    color: item.color || FALLBACK_COLOR,
    total: item.total,
    cantidad_preguntas: item.cantidadPreguntas,
  }));

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-blue-200">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-gray-700" />
        <h3 className="font-medium text-gray-800">{title}</h3>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((index) => (
            <div key={index} className="rounded-xl border border-gray-100 p-4">
              <div className="h-5 w-32 rounded bg-gray-100" />
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                <div className="h-8 rounded bg-gray-100" />
                <div className="h-8 rounded bg-gray-100" />
                <div className="h-8 rounded bg-gray-100" />
                <div className="h-8 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-10 text-center text-sm text-red-700">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 text-center text-sm text-gray-500">
          No hay datos para este período
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <BarEmotionChart data={chartData} />
        </div>
      )}
    </div>
  );
}

export function StudentEmotionsSection({
  studentId,
  schoolId = 0,
}: StudentEmotionsSectionProps) {
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [startDate, setStartDate] = useState<Date | null>(defaultRange.start);
  const [endDate, setEndDate] = useState<Date | null>(defaultRange.end);

  const effectiveStartDate = startDate ?? defaultRange.start;
  const effectiveEndDate = endDate ?? defaultRange.end;
  const normalizedStartDate =
    effectiveStartDate <= effectiveEndDate ? effectiveStartDate : effectiveEndDate;
  const normalizedEndDate =
    effectiveEndDate >= effectiveStartDate ? effectiveEndDate : effectiveStartDate;

  const fechaDesde = formatDateForApi(normalizedStartDate);
  const fechaHasta = formatDateForApi(normalizedEndDate);
  const positiveRequest = useAxios<StudentEmotionSource[]>(
    () =>
      window.axios.get(`/alumnos/detalle/${studentId}/emociones/top`, {
        params: {
          tipo: "positivo",
          colegio_id: schoolId,
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
        },
      }),
    [studentId, schoolId, fechaDesde, fechaHasta]
  );
  const negativeRequest = useAxios<StudentEmotionSource[]>(
    () =>
      window.axios.get(`/alumnos/detalle/${studentId}/emociones/top`, {
        params: {
          tipo: "negativo",
          colegio_id: schoolId,
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
        },
      }),
    [studentId, schoolId, fechaDesde, fechaHasta]
  );
  const neutralRequest = useAxios<StudentEmotionSource[]>(
    () =>
      window.axios.get(`/alumnos/detalle/${studentId}/emociones/top`, {
        params: {
          tipo: "neutro",
          colegio_id: schoolId,
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
        },
    }),
    [studentId, schoolId, fechaDesde, fechaHasta]
  );
  const pathologiesRequest = useAxios<StudentDiagnosticSource[]>(
    () =>
      window.axios.get(`/alumnos/detalle/${studentId}/patologias/top`, {
        params: {
          colegio_id: schoolId,
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
        },
      }),
    [studentId, schoolId, fechaDesde, fechaHasta]
  );
  const neurodivergencesRequest = useAxios<StudentDiagnosticSource[]>(
    () =>
      window.axios.get(`/alumnos/detalle/${studentId}/neurodivergencias/top`, {
        params: {
          colegio_id: schoolId,
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
        },
      }),
    [studentId, schoolId, fechaDesde, fechaHasta]
  );

  const mapEmotionData = (items: StudentEmotionSource[] | null | undefined, connotation: EmotionTypeParam) =>
    (items ?? []).map((item) => ({
      name: item.nombre,
      value: Number(
        connotation === "positivo"
          ? item.positivos ?? item.total ?? 0
          : connotation === "negativo"
            ? item.negativos ?? item.total ?? 0
            : item.neutrales ?? item.total ?? 0
      ),
      positivos: Number(item.positivos ?? 0),
      neutrales: Number(item.neutrales ?? 0),
      negativos: Number(item.negativos ?? 0),
      color: item.color || FALLBACK_COLOR,
      connotation,
    }));

  const groups = useMemo<StudentEmotionGroups>(
    () => ({
      positivo: mapEmotionData(positiveRequest.data, "positivo"),
      negativo: mapEmotionData(negativeRequest.data, "negativo"),
      neutro: mapEmotionData(neutralRequest.data, "neutro"),
    }),
    [positiveRequest.data, negativeRequest.data, neutralRequest.data]
  );
  const comparisonEmotionNames = useMemo(
    () => buildComparisonEmotionNames(groups),
    [groups]
  );
  const comparisonRequest = useAxios<StudentEmotionComparisonApiResponse>(
    () => {
      if (comparisonEmotionNames.length === 0) {
        return undefined;
      }

      return window.axios.get(`/alumnos/detalle/${studentId}/emociones/comparativa`, {
        params: {
          colegio_id: schoolId,
          emociones: comparisonEmotionNames.join(","),
          scope: "curso",
          peso: 0,
          fecha_desde: fechaDesde,
          fecha_hasta: fechaHasta,
        },
      });
    },
    [studentId, schoolId, fechaDesde, fechaHasta, comparisonEmotionNames.join(",")]
  );
  const radarData = useMemo(
    () =>
      comparisonEmotionNames.length === 0
        ? []
        : buildRadarComparisonDataFromApi(comparisonRequest.data),
    [comparisonEmotionNames.length, comparisonRequest.data]
  );
  const pathologyItems = useMemo(
    () => buildStudentDiagnosticItems(pathologiesRequest.data),
    [pathologiesRequest.data]
  );
  const neurodivergenceItems = useMemo(
    () => buildStudentDiagnosticItems(neurodivergencesRequest.data),
    [neurodivergencesRequest.data]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border border-blue-100 bg-blue-50/40 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">
            Período de análisis del alumno
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:max-w-2xl">
          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-600">Desde</span>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              maxDate={normalizedEndDate}
              placeholderText="Fecha inicial"
            />
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-600">Hasta</span>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              minDate={normalizedStartDate}
              maxDate={defaultRange.end}
              placeholderText="Fecha final"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <EmotionBarCard
          title="Emociones Positivas"
          icon={Smile}
          data={groups.positivo}
          loading={positiveRequest.loading}
          error={positiveRequest.error}
          emptyMessage="No hay datos para emociones positivas en este período."
        />
        <EmotionBarCard
          title="Emociones Negativas"
          icon={Frown}
          data={groups.negativo}
          loading={negativeRequest.loading}
          error={negativeRequest.error}
          emptyMessage="No hay datos para emociones negativas en este período."
        />
        <EmotionBarCard
          title="Emociones Neutras"
          icon={Meh}
          data={groups.neutro}
          loading={neutralRequest.loading}
          error={neutralRequest.error}
          emptyMessage="No hay datos para emociones neutras en este período."
        />
      </div>

      {(positiveRequest.error || negativeRequest.error || neutralRequest.error) &&
        !positiveRequest.loading &&
        !negativeRequest.loading &&
        !neutralRequest.loading && (
          <div className="flex items-start rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertCircle className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Algunas fuentes de emociones no se pudieron cargar. Comparativa mostrada con datos disponibles.
            </span>
          </div>
        )}

      <div className="grid grid-cols-1 gap-6">
        <DiagnosticSectionCard
          title="Patologías"
          icon={HeartPulse}
          items={pathologyItems}
          loading={pathologiesRequest.loading}
          error={pathologiesRequest.error}
        />
        <DiagnosticSectionCard
          title="Neurodivergencias"
          icon={Brain}
          items={neurodivergenceItems}
          loading={neurodivergencesRequest.loading}
          error={neurodivergencesRequest.error}
        />
      </div>

      <EmotionRadarCard
        data={radarData}
        loading={comparisonRequest.loading}
        error={comparisonRequest.error}
        hasSelection={comparisonEmotionNames.length > 0}
      />
    </div>
  );
}
