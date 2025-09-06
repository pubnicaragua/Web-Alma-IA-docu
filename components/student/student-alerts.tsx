"use client";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { AddAlertModal } from "@/components/student/add-alert-modal";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/use-pagination";
import { StudentAlert } from "@/types/student";
import {
  ALERT_PRIORITIES,
  ALERT_PRIORITIES_CLASS,
  ALERT_SEVERITY_CLASS,
  ALERT_TYPES
} from "@/constants/alerts";
import { formatDate } from "@/lib/utils";
import { formatTime, parseDateTime } from "@/lib/dates";

interface Alert {
  alumno_alerta_id: number;
  fecha: string; // formato "DD/MM/YYYY"
  hora: string; // formato "HH:mm"
  tipo: string;
  estado: string;
  prioridad: string;
  responsable: string | null;
  severidad_name: string;
}

interface StudentAlertsProps {
  alerts: StudentAlert[];
  setRefresh: () => void;
}

const getTipoAlerta = (tipoId: number) => {
  return ALERT_TYPES[tipoId as keyof typeof ALERT_TYPES] || "Desconocido";
};

const getPrioridad = (prioridadId: number) => {
  return ALERT_PRIORITIES[prioridadId as keyof typeof ALERT_PRIORITIES] || "Desconocido";
};

const getPrioridadClass = (prioridad: string) => {
  const cleaned = prioridad.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return ALERT_PRIORITIES_CLASS[cleaned.toLowerCase() as keyof typeof ALERT_PRIORITIES_CLASS] || "";
}

const getEstadoClass = (estado: string) => {
  const cleaned = estado.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return ALERT_SEVERITY_CLASS[cleaned.toLowerCase() as keyof typeof ALERT_SEVERITY_CLASS] || "";
}

export function StudentAlerts({
  alerts: initialAlerts,
  setRefresh,
}: StudentAlertsProps) {

  const router = useRouter();

  const formatedAlerts: Alert[] = useMemo(() => {
    const formatted = initialAlerts.map((alerta) => ({
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
  }, [initialAlerts]);

  const pagination = usePagination<Alert>(formatedAlerts, 10)

  const handleAlertClick = (alertId: number) => {
    router.push(`/alertas/${alertId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Alertas del alumno
        </h3>
        <AddAlertModal onRefresh={setRefresh} />
      </div>

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
              <tr
                key={alert.alumno_alerta_id}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAlertClick(alert.alumno_alerta_id)}
              >
                <td className="px-4 py-3 text-sm text-center">{alert.fecha}</td>
                <td className="px-4 py-3 text-sm text-center">{alert.hora}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <div className="flex justify-center">
                    <Badge>{alert.tipo}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <Badge
                    variant="outline"
                    className={getEstadoClass(alert.estado)}
                  >
                    {alert.estado}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <Badge
                    variant="outline"
                    className={getPrioridadClass(alert.prioridad)}
                  >
                    {alert.prioridad}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <Badge
                    variant="outline"
                    className={getPrioridadClass(alert.severidad_name)}
                  >
                    {alert.severidad_name}
                  </Badge>
                </td>
              </tr>
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
    </div>
  );
}
