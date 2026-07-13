"use client"

import { useState, useEffect, useRef } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Smile, RefreshCw, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useColoresCatalog } from "@/hooks/use-colores"
import { fetchEmotionsForGrade } from "@/services/home-service"

interface EmotionData {
  name: string // Ejemplo: "1Â° Medio A - Jornada MaÃ±ana"
  [emotion: string]: string | number // Ejemplo: "Ansiedad": 3, "Felicidad": 2
}

interface ComparisonData {
  name: string
  cursoA: number
  cursoB?: number
  color: string
}

interface BarChartComparisonCategoryProps {
  title: string
  gradoA: number
  gradoB?: number
  courseAName?: string | null
  courseBName?: string | null
  fechaDesde?: string
  fechaHasta?: string
}

export function BarChartComparisonCategory({
  title,
  gradoA,
  gradoB,
  courseAName,
  courseBName,
  fechaDesde,
  fechaHasta,
}: BarChartComparisonCategoryProps) {
  const [rawDataA, setRawDataA] = useState<EmotionData[]>([])
  const [rawDataB, setRawDataB] = useState<EmotionData[]>([])
  const [data, setData] = useState<ComparisonData[]>([])
  const [allEmotions, setAllEmotions] = useState<string[]>([])
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { getColor } = useColoresCatalog()

  const currentRequest = useRef(0)

  const fetchGradoData = async (currentGradoA: number, currentGradoB?: number) => {
    const requestId = ++currentRequest.current
    try {
      setIsLoading(true)
      setError(null)
      const [emotionsDataA, emotionsDataB] = await Promise.all([
        fetchEmotionsForGrade(currentGradoA, fechaDesde, fechaHasta),
        currentGradoB ? fetchEmotionsForGrade(currentGradoB, fechaDesde, fechaHasta) : Promise.resolve([]),
      ])
      if (requestId === currentRequest.current) {
        setRawDataA(emotionsDataA as unknown as EmotionData[])
        setRawDataB(emotionsDataB as unknown as EmotionData[])
      }
    } catch (err) {
      if (requestId === currentRequest.current) {
        setError("No se pudieron cargar los datos de emociones. Intente nuevamente.")
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar los datos de emociones. Intente nuevamente.",
          variant: "destructive",
        })
      }
    } finally {
      if (requestId === currentRequest.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (gradoA !== undefined) {
      fetchGradoData(gradoA, gradoB)
    }
  }, [gradoA, gradoB, fechaDesde, fechaHasta])

  useEffect(() => {
    if (!rawDataA) return;

    const courseA = rawDataA.find((item) => item.name === courseAName) ?? rawDataA[0]
    const courseB = courseBName
      ? (rawDataB.find((item) => item.name === courseBName) ?? rawDataA.find((item) => item.name === courseBName))
      : undefined
    const { name: _courseAName, ...valuesA } = courseA ?? { name: "" }
    const { name: _courseBName, ...valuesB } = courseB ?? { name: "" }
    const emotionsList = Array.from(
      new Set([...Object.keys(valuesA), ...Object.keys(valuesB)])
    ).filter((key) => !key.startsWith("__"))

    setData(
      emotionsList.map((emotion) => ({
        name: emotion,
        cursoA: Number(valuesA[emotion] ?? 0),
        cursoB: courseB ? Number(valuesB[emotion] ?? 0) : undefined,
        color: getEmotionColor(emotion),
      }))
    )
    setAllEmotions(emotionsList)
    
    setSelectedEmotions((prev) => {
      const prevSet = new Set(prev)
      const missing = emotionsList.filter(e => !prevSet.has(e))
      return missing.length > 0 ? [...prev, ...missing] : prev.filter(e => emotionsList.includes(e))
    })
  }, [rawDataA, rawDataB, courseAName, courseBName])

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    )
  }

  const selectAll = () => {
    setSelectedEmotions(allEmotions)
  }

  const deselectAll = () => {
    setSelectedEmotions([])
  }

  const getEmotionColor = (emotion: string): string =>
    getColor("emociones", emotion, "#6c757d")

  const filteredEmotions = allEmotions.filter((emotion) =>
    emotion.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const chartData = data.filter((item) => selectedEmotions.includes(item.name))
  const hasCourseB = Boolean(courseBName)

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
    )
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
          onClick={() => fetchGradoData(gradoA, gradoB)}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
        </button>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-blue-200">
        <div className="flex items-center mb-4">
          <Smile className="mr-2 text-gray-700" />
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <div className="text-gray-500 text-center py-10">No hay datos de emociones disponibles.</div>
      </div>
    )
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
              placeholder="Buscar emoción..."
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
                Todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 h-7 border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={deselectAll}
              >
                Ninguno
              </Button>
            </div>
          </div>

          {/* Listado Scrollable de Badges */}
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-gray-50/50 rounded-md border border-gray-100 scrollbar-thin">
            {filteredEmotions.length === 0 ? (
              <span className="text-xs text-gray-400 p-1">No se encontraron emociones.</span>
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
            data={chartData}
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
                              <span className="text-gray-600 truncate">
                                {entry.name === "cursoA" ? courseAName : courseBName}
                              </span>
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
            <Bar dataKey="cursoA" name={courseAName ?? "Curso"} radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={`a-${entry.name}`} fill={entry.color} />
              ))}
            </Bar>
            {hasCourseB && (
              <Bar dataKey="cursoB" name={courseBName ?? "Curso B"} radius={[4, 4, 0, 0]} fillOpacity={0.55}>
                {chartData.map((entry) => (
                  <Cell key={`b-${entry.name}`} fill={entry.color} />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-gray-800" />
          {courseAName ?? "Curso"} {hasCourseB ? "(barra izq)" : ""}
        </span>
        {hasCourseB && (
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-gray-400" />
            {courseBName} (barra der)
          </span>
        )}
      </div>
    </div>
  )
}
