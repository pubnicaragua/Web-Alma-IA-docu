import { BitacoraResponse } from "@/services/alerts-service";


interface PropTypes {
    bitacora: BitacoraResponse;
}

export const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    // Si la fecha contiene "T", se asume formato ISO
    if (dateString.includes("T")) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    // Si es formato dd-MM-yyyy
    const parts = dateString.split("-");
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        if (isNaN(date.getTime())) return "-";
        const d = date.getDate().toString().padStart(2, "0");
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    }
    return "-";
};

export function BinnacleTableItem({ bitacora }: Readonly<PropTypes>) {

    return (
        <tr className="border-b border-gray-100 py-2 pl-4 hover:bg-gray-50">
            <td className="px-4 py-3 text-sm">
                {formatDate(bitacora.fecha_realizacion) !== "-"
                    ? formatDate(bitacora.fecha_realizacion)
                    : formatDate(bitacora.fecha_compromiso)}
            </td>
            <td
                className="px-4 py-3 text-sm truncate max-w-[12ch]"
                title={bitacora.plan_accion}
            >
                {bitacora.plan_accion}
            </td>
            <td className="px-4 py-3 text-sm">
                {formatDate(bitacora.fecha_compromiso)}
            </td>
            <td className="px-4 py-3 text-sm">
                {bitacora.url_archivo ? (
                    <a
                        href={bitacora.url_archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                    >
                        Ver archivo
                    </a>
                ) : (
                    "-"
                )}
            </td>
        </tr>
    )
}