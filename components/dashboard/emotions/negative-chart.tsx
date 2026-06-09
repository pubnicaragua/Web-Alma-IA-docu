import { useState } from "react";
import { Frown, TriangleAlert } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { IEmotionBarChart } from "@/types/dashboard";
import { useUser } from "@/middleware/user-context";
import { useAxios } from "@/hooks/use-axios";
import { BarEmotionChart } from "./bar-chart";

export function BarNegativeEmotionsChart() {

    const { selectedSchoolId } = useUser();
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const axios = useAxios(
        () => {
            if (!selectedSchoolId) return;
            return window.axios.get('/comparativa/emociones/top-diagnosticos', {
                params: {
                    colegio_id: selectedSchoolId,
                    fecha: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
                    tipo: 'negativo'
                }
            })
        },
        [selectedDate, selectedSchoolId]
    );

    return (
        <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-blue-200">

            {/* Nombre del grafico y filtro */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                    <Frown className="mr-2 text-gray-700" />
                    <h3 className="font-medium text-gray-800">
                        Emociones Negativas y Neutras
                    </h3>
                </div>
                <div className="flex gap-2 items-center">
                    <label className="text-right text-gray-700" htmlFor="">
                        Datos al:
                    </label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={setSelectedDate}
                        maxDate={new Date()}
                        placeholderText="Seleccione una fecha"
                        className="w-40 p-2 rounded-md text-center"
                    />
                </div>
            </div>

            {(axios.loading) ? (
                <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm animate-pulse">
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
            ) : (
                <div>
                    {(axios.error) && (
                        <p className="p-4 text-sm text-red-800 text-center rounded-lg bg-red-50">
                            {axios.error}
                        </p>
                    )}

                    {(!axios.data || (Array.isArray(axios.data) && !axios.data.length)) && (
                        <div className="p-4 text-sm text-red-800 text-center rounded-lg bg-red-50">
                            <TriangleAlert className="inline" />
                            <p>No hay datos disponibles</p>
                        </div>
                    )}

                    {/* Grafico */}
                    <BarEmotionChart data={(axios.data as IEmotionBarChart[]) || []} />
                </div>
            )}
        </div>
    );
}
