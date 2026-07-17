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

export function NoticeModalView({ avisoId, table = true }: any) {

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
                .filter(([key, value]) => !['porcentaje_lectura', 'promedio_intentos'].includes(key) && Number(value) > 0)
                .map(([key, value]) => ({
                    name: key.replace(/total_?/i, "").replace(/_/g, " ").trim().replace(/^\w/, (c) => c.toUpperCase()),
                    value,
                })),
        [axios.data]
    );

    const total = resume.reduce((acc, item: any) => acc + item?.value, 0);

    return (
        <>
            {table ? (
                <Button size={'sm'} variant={'link'} onClick={onOpen}>
                    <Eye />
                </Button>
            ) : (
                <Button className="bg-blue-500 hover:bg-blue-600" onClick={onOpen}>
                    <FileChartPie />
                    <span>Resumen Global</span>
                </Button>
            )}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                        <div className="w-full flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold">
                                {table ? "Vista del Aviso" : "Resumen Global"}
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
                                    <defs>
                                        <filter id="label-bg" x="-0.1" y="-0.2" width="1.2" height="1.4">
                                            <feFlood floodColor="#f1f5f9" floodOpacity="0.9" result="bg" />
                                            <feMerge>
                                                <feMergeNode in="bg" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <Pie
                                        data={resume}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                        label={({ name, percent, x, y, textAnchor, fill }) => (
                                            <text 
                                                x={x} 
                                                y={y} 
                                                textAnchor={textAnchor} 
                                                dominantBaseline="central" 
                                                filter="url(#label-bg)"
                                                fill={fill}
                                                fontSize={13}
                                                fontWeight="600"
                                            >
                                                {`${name} ${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        )}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {resume.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend 
                                        formatter={(value, entry: any) => (
                                            <span className="bg-slate-100 px-2 py-1 rounded-md font-medium text-sm" style={{ color: entry?.color }}>
                                                {value}
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}


