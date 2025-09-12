'use client'
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
    ALERT_PRIORITIES_CLASS,
    ALERT_SEVERITY_CLASS,
} from "@/constants/alerts";
import { AlertItemFormatted } from "@/types/student";

const getPrioridadClass = (prioridad: string) => {
    const cleaned = prioridad.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return ALERT_PRIORITIES_CLASS[cleaned.toLowerCase() as keyof typeof ALERT_PRIORITIES_CLASS] || "";
}

const getEstadoClass = (estado: string) => {
    const cleaned = estado.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return ALERT_SEVERITY_CLASS[cleaned.toLowerCase() as keyof typeof ALERT_SEVERITY_CLASS] || "";
}

interface PropTypes {
    alert: AlertItemFormatted;
}

export function StudentDetailAlertTableItem({ alert }: Readonly<PropTypes>) {

    const router = useRouter();

    const handleAlertClick = (alertId: number) => {
        router.push(`/alertas/${alertId}`);
    };

    return (
        <tr
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
    )
}