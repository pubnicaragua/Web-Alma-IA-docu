import { useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Eye, X, FileChartPie, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/lib/modal-utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { useAxios } from "@/hooks/use-axios";
import { useUser } from "@/middleware/user-context";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA46BE"];

export function SurveyModalView({ avisoId, table = true }: any) {

    const { selectedSchoolId } = useUser();
    const { isOpen, onOpen, onClose } = useModal();
    const axios = useAxios<any>();

    useEffect(() => {
        if (!isOpen) return;
        axios.execute(() => window.axios.get(`/avisosApp/avisos/resumen`, {
            params: {
                colegio_id: selectedSchoolId,
                aviso_id: avisoId
            }
        }))
    }, [selectedSchoolId, isOpen, avisoId]);

    const resume = useMemo(
        () =>
            Object.entries(axios.data?.data?.resumen?.[0] ?? {})
                .filter(([key]) => !['porcentaje_lectura', 'promedio_intentos'].includes(key))
                .map(([key, value]) => {
                    const cleanName = key.replace(/^total_?/i, "").replace(/_/g, " ");
                    const name = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
                    return {
                        name,
                        value,
                    };
                }),
        [axios.data]
    );

    const total = resume.reduce((acc, item: any) => acc + item?.value, 0);

    return (
        <>
            {table ? (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onOpen}
                    title="Ver Resultados Globales (Gráfico)"
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600 font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-sm px-3 py-1.5"
                >
                    <FileChartPie className="h-4 w-4" />
                    <span>Ver Resultados</span>
                </Button>
            ) : (
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={onOpen}>
                    <FileChartPie />
                    <span>Resumen Global</span>
                </Button>
            )}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky -top-6 -mx-6 px-6 pt-6 bg-white z-20 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                {table ? "Universo total de la Encuesta" : "Resumen Global"}
                            </DialogTitle>
                            <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground flex items-center justify-center">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Cerrar</span>
                            </DialogClose>
                        </div>
                    </DialogHeader>

                    {axios.loading && (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando Resumen...</p>
                        </div>
                    )}
                    {!axios.loading && !total && (
                        <div className="p-4 text-sm text-red-800 text-center rounded-lg bg-red-50">
                            <TriangleAlert className="inline" />
                            <p>No hay datos disponibles</p>
                        </div>
                    )}
                    {!axios.loading && Boolean(total) && (
                        <div className="w-100 h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={resume}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => {
                                            const percentage = (Number(value) / total) * 100;
                                            return percentage > 0 ? `${name} ${percentage.toFixed(0)}%` : '';
                                        }}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {resume.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}


