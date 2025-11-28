import { useMemo } from "react";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { usePaginationSR } from "@/hooks/use-pagination-sr";
import { SSRPagination } from "@/components/utils/pagination-sr";
import { useUser } from "@/middleware/user-context";
import { SurveyTableItem } from "./item";
import { useRefresh } from "@/hooks/use-refresh";

interface PropTypes {
    filters: any;
}

export function SurveyTable({ filters }: Readonly<PropTypes>) {

    const { selectedSchoolId } = useUser();
    const { refresh } = useRefresh();

    const computedFilters = useMemo(() => ({
        ...filters,
        colegio_id: selectedSchoolId
    }), [filters, selectedSchoolId, refresh])

    const pagination = usePaginationSR({
        route: "/encuestas/listar",
        filters: computedFilters,
        perPage: 10,
        enabled: Boolean(selectedSchoolId)
    });

    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {pagination.loading && (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando Encuestas...</p>
                    </div>
                )}
                {!pagination.loading && pagination.data.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron encuestas que coincidan con los filtros seleccionados.
                    </div>
                )}
                {!pagination.loading && pagination.data.length > 0 && (
                    <>
                        <Table>
                            <TableHeader className="bg-[#89C2F8]">
                                <TableRow>
                                    <TableHead className="text-white">ID</TableHead>
                                    <TableHead className="text-white">Título</TableHead>
                                    <TableHead className="text-white">Tipo</TableHead>
                                    <TableHead className="text-white">Estado</TableHead>
                                    <TableHead className="text-white">Frecuencía</TableHead>
                                    <TableHead className="text-white">Fecha Inicio | Fin</TableHead>
                                    <TableHead className="text-white text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.map((survey: any) => (
                                    <SurveyTableItem
                                        key={survey?.encuesta_id}
                                        survey={survey}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                        <SSRPagination pagination={pagination} />
                    </>
                )}
            </div>
        </div>
    )
}