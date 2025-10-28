import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { NoticeTableItem } from "./item";
import { usePaginationSR } from "@/hooks/use-pagination-sr";
import { SSRPagination } from "@/components/utils/pagination-sr";

interface PropTypes {
    filters: any;
}

export function NoticeTable({ filters }: Readonly<PropTypes>) {

    const pagination = usePaginationSR({
        route: "/avisosApp/avisos/listar",
        filters: filters,
        perPage: 10
    });

    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {pagination.loading && (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando Avisos...</p>
                    </div>
                )}
                {!pagination.loading && pagination.data.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron alertas que coincidan con los filtros seleccionados.
                    </div>
                )}
                {!pagination.loading && pagination.data.length > 0 && (
                    <>
                        <Table>
                            <TableHeader className="bg-[#89C2F8]">
                                <TableRow>
                                    <TableHead className="text-white">ID</TableHead>
                                    <TableHead className="text-white">Título</TableHead>
                                    <TableHead className="text-white">Tipo Aviso</TableHead>
                                    <TableHead className="text-white">Tipo Persona</TableHead>
                                    <TableHead className="text-white">Palabras Clave</TableHead>
                                    <TableHead className="text-white">Fecha Programación</TableHead>
                                    <TableHead className="text-white text-center">Estado</TableHead>
                                    <TableHead className="text-white text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pagination.data.map((notice) => (
                                    <NoticeTableItem key={notice?.aviso_id} notice={notice} />
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