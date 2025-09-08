'use client';
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlumnoFormatted,
    AlumnosResponse,
    AssitedEvaluationFilter,
    Pregunta,
} from "@/types/assisted-evaluation";
import { useAxios } from "@/hooks/use-axios";
import { AssitedEvaluationTableItem } from "./item";
import { format } from "date-fns";
import { TriangleAlert } from "lucide-react";

interface PropTypes {
    filters: AssitedEvaluationFilter | null;
    preguntas: Pregunta[];
}

export function AssitedEvaluationTable({
    filters,
    preguntas,
}: Readonly<PropTypes>) {
    // ToDo:: Optimizar performance usando un Map en vez de un arreglo.
    const [alumnos, setAlumnos] = useState<AlumnoFormatted[]>([]);
    const axios = useAxios<AlumnosResponse>();

    const pregunta = useMemo(() => {
        if (!filters?.pregunta_id) return null;
        return preguntas.find((p) => p.id === filters?.pregunta_id);
    }, [preguntas, filters?.pregunta_id]);

    const handleClickCheckbox = useCallback(
        (alumnoId: number, opcion: number | null) => {
            setAlumnos((prevAlumnos) => prevAlumnos.map((alumno) =>
                alumno.alumno_id === alumnoId ? { ...alumno, respuesta_id: opcion } : alumno
            ));
        },
        [alumnos]
    );

    const handleUpdateAnswer = (alumnoId: number, observacion: string, hora: string) => {
        setAlumnos((prevAlumnos) => {
            return prevAlumnos.map((alumno) =>
                alumno.alumno_id === alumnoId ? {
                    ...alumno,
                    observacion,
                    hora
                } : alumno
            )
        });
    }

    useEffect(() => {
        if (!filters) return;
        axios.execute(() =>
            window.axios.get(`/evaluacion-asistida/alumno`, {
                params: {
                    fecha_encuetada: format(filters?.fecha as Date, "yyyy-MM-dd"),
                    eventos_preguntas_id: filters?.pregunta_id,
                    curso_id: filters?.curso_id,
                },
            })
        );
    }, [filters?.curso_id, filters?.fecha, filters?.pregunta_id]);

    useEffect(() => {
        if (!axios.data) return;
        const resultado = axios?.data?.alumnosEncuestados.map(({ alumnos }) => ({
            alumno_id: alumnos.alumno_id,
            alumno_nombre: `${alumnos.personas.nombres} ${alumnos.personas.apellidos}`,
            respuesta_id: alumnos.alumnos_eventos[0]?.evento_respuesta_posible_id ?? null,
            observacion: alumnos.alumnos_eventos[0]?.observacion ?? null,
            hora: alumnos.alumnos_eventos[0]?.hora ?? ''
        }));
        setAlumnos(resultado);
    }, [axios.data]);

    const filteredAlumnos = useMemo(() => {
        if (!filters?.alumno_nombre) return alumnos;
        return alumnos.filter((alumno) =>
            alumno.alumno_nombre
                .toLowerCase()
                .includes(String(filters?.alumno_nombre).toLowerCase())
        );
    }, [alumnos, filters?.alumno_nombre]);

    return (
        <div className="mt-6">
            {pregunta && (
                <>
                    <h2 className="font-poppins mb-6 font-bold text-[26px] leading-[39px] tracking-[0px]">
                        {pregunta.pregunta}
                    </h2>
                    <div className="rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-[#89C2F8]">
                                <TableRow className="h-[60px]">
                                    <TableHead className="text-white text-center">ID</TableHead>
                                    <TableHead className="text-white print:text-left text-center">
                                        Nombres
                                    </TableHead>
                                    {pregunta.evento_respuestas_posibles.map(
                                        ({ respuesta_texto: nombre, id: valor }) => (
                                            <TableHead className="text-white text-center" key={valor}>
                                                {nombre}
                                            </TableHead>
                                        )
                                    )}
                                    <TableHead className="print:hidden text-white text-center">
                                        Observaciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {axios.loading && (
                                    <TableRow>
                                        <TableCell colSpan={100}>
                                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                                <p className="text-gray-600">Cargando alumnos...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!axios.loading && axios.data && filteredAlumnos.length > 0 && (
                                    <>
                                        {filteredAlumnos.map((alumno) => (
                                            <AssitedEvaluationTableItem
                                                key={alumno.alumno_id}
                                                alumno={alumno}
                                                preguntaId={filters?.pregunta_id as number}
                                                cursoId={filters?.curso_id as number}
                                                fecha={format(filters?.fecha as Date, "yyyy-MM-dd")}
                                                opciones={pregunta.evento_respuestas_posibles}
                                                handleCheck={handleClickCheckbox}
                                                handleUpdate={handleUpdateAnswer}
                                            />
                                        ))}
                                    </>
                                )}
                                {!axios.loading && axios.data && filteredAlumnos.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={100}>
                                            <div className="flex flex-col items-center p-8 text-center">
                                                <TriangleAlert />
                                                <p className="text-gray-600">
                                                    No se han encontrado alumnos
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}
        </div>
    );
}
