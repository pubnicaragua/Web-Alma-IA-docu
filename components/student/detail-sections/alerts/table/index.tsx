"use client";
import { useMemo } from "react";
import { usePagination } from "@/hooks/use-pagination";
import { AlertItemFormatted, StudentAlert } from "@/types/student";
import {
    ALERT_PRIORITIES,
    ALERT_TYPES
} from "@/constants/alerts";
import { formatDate, formatTime, parseDateTime } from "@/lib/dates";
import { StudentDetailAlertTableItem } from "./item";

interface StudentAlertsProps {
    alerts: StudentAlert[];
}

const getTipoAlerta = (tipoId: number) => {
    return ALERT_TYPES[tipoId as keyof typeof ALERT_TYPES] || "Desconocido";
};

const getPrioridad = (prioridadId: number) => {
    return ALERT_PRIORITIES[prioridadId as keyof typeof ALERT_PRIORITIES] || "Desconocido";
};

export function StudentDetailAlertsTable({ alerts }: Readonly<StudentAlertsProps>) {

    const formatedAlerts: AlertItemFormatted[] = useMemo(() => {
        const formatted = alerts.map((alerta) => ({
            alumno_alerta_id: alerta.alumno_alerta_id,
            fecha: formatDate(alerta.fecha_generada),
            hora: formatTime(alerta.fecha_generada),
            tipo: getTipoAlerta(alerta.alertas_tipo_alerta_tipo_id),
            estado: alerta.estado,
            prioridad: getPrioridad(alerta.prioridad_id),
            responsable:
                alerta?.persona_responsable_actual?.nombres +
                " " +
                alerta?.persona_responsable_actual?.apellidos,
            severidad_name: alerta.alertas_severidades.nombre,
        }));

        return formatted.sort((a, b) => {
            const dateA = parseDateTime(a.fecha, a.hora);
            const dateB = parseDateTime(b.fecha, b.hora);
            return dateB.getTime() - dateA.getTime();
        })
    }, [alerts]);

    const pagination = usePagination<AlertItemFormatted>(formatedAlerts, 10)

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto border border-gray-100">
                <table className="w-full min-w-[640px]">
                    <thead>
                        <tr className="bg-blue-300">
                            <th className="px-4 py-3 text-center font-medium text-white">
                                Fecha
                            </th>
                            <th className="px-4 py-3 text-center font-medium text-white">
                                Hora
                            </th>
                            <th className="px-4 py-3 text-center font-medium text-white">
                                Tipo de alerta
                            </th>
                            <th className="px-4 py-3 text-center font-medium text-white">
                                Estado
                            </th>
                            <th className="px-4 py-3 text-center font-medium text-white">
                                Nivel de prioridad
                            </th>
                            <th className="px-4 py-3 text-center font-medium text-white">
                                Severidad
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagination.paginated.map((alert) => (
                            <StudentDetailAlertTableItem key={alert.alumno_alerta_id} alert={alert} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Controles de paginación */}
            <div className="flex justify-center items-center space-x-2 mt-4">
                <button
                    onClick={pagination.prev}
                    disabled={pagination.page === 0}
                    className={`px-3 py-1 rounded border ${pagination.page === 0
                        ? "cursor-not-allowed border-gray-300 text-gray-300"
                        : "border-blue-500 text-blue-500 hover:bg-blue-100"
                        }`}
                >
                    Anterior
                </button>

                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                    .slice(
                        Math.max(0, pagination.page - 3),
                        Math.min(pagination.lastPage, pagination.page + 2)
                    )
                    .map((page) => (
                        <button
                            key={page}
                            onClick={() => pagination.setPage(page)}
                            className={`px-3 py-1 rounded border ${page === pagination.page
                                ? "bg-blue-500 text-white border-blue-500"
                                : "border-blue-500 text-blue-500 hover:bg-blue-100"
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                <button
                    onClick={pagination.next}
                    disabled={pagination.page == pagination.lastPage}
                    className={`px-3 py-1 rounded border ${pagination.page == pagination.lastPage || pagination.lastPage < 1
                        ? "cursor-not-allowed border-gray-300 text-gray-300"
                        : "border-blue-500 text-blue-500 hover:bg-blue-100"
                        }`}
                >
                    Siguiente
                </button>
            </div>
        </>
    );
}
