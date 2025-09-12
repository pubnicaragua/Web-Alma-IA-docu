import { useAxios } from "@/hooks/use-axios"
import { BitacoraResponse } from "@/services/alerts-service";
import { useEffect } from "react";
import { BinnacleTableItem } from "./item";


interface PropTypes {
    alertId: number
    refresh: boolean
}

export function BinnacleTable({ alertId, refresh }: Readonly<PropTypes>) {

    const axios = useAxios<BitacoraResponse[]>(() => window.axios.get('/alumnos/alertas_bitacoras', {
        params: {
            alumno_alerta_id: alertId
        }
    }));

    useEffect(() => {
        axios.refetch();
    }, [refresh])

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full min-w-[520px]">
                <thead>
                    <tr className="bg-blue-300">
                        <th className="px-4 py-3 text-left font-medium text-white">
                            Fecha Realización
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-white">
                            Acción Realizada
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-white">
                            Fecha de Compromiso
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-white">
                            Archivo
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {axios.loading && (
                        <tr>
                            <td
                                colSpan={100}
                                className="px-4 py-6 text-center text-gray-500"
                            >
                                Cargando...
                            </td>
                        </tr>
                    )}
                    {!axios.loading && axios.data?.length === 0 && (
                        <tr>
                            <td
                                colSpan={100}
                                className="px-4 py-6 text-center text-gray-500"
                            >
                                No hay acciones registradas para esta alerta
                            </td>
                        </tr>
                    )}
                    {!axios.loading && axios.data && axios.data.length > 0 && (
                        <>
                            {axios.data?.map((bitacora) => (
                                <BinnacleTableItem
                                    key={bitacora.alumno_alerta_bitacora_id}
                                    bitacora={bitacora}
                                />
                            ))
                            }
                        </>
                    )}
                </tbody>
            </table>
        </div>
    )
}