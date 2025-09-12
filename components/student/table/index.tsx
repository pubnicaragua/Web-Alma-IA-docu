'use client'
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { SSRPagination } from "@/components/utils/pagination-sr";
import { usePaginationSR } from "@/hooks/use-pagination-sr";
import { ApiStudent, mapApiStudentsToStudents } from "@/services/students-service";
import { StudentTableItem } from "./item";
import { useUser } from "@/middleware/user-context";

const columns = [
    { key: "name", title: "Alumno" },
    { key: "level", title: "Nivel" },
    { key: "course", title: "Curso" },
    { key: "age", title: "Edad" },
    { key: "status", title: "Estado" },
];

export function StudentTable({ filters, refresh }: Readonly<{ filters: any, refresh: boolean }>) {
    const { selectedSchoolId } = useUser();
    const searParams = useSearchParams();
    const searchParam = searParams.get("search") ?? "";

    const computedFilters = useMemo(
        () => ({
            ...filters,
            colegio_id: selectedSchoolId,
            shourh: searchParam || undefined,
        }),
        [filters, searchParam, selectedSchoolId]
    );

    const pagination = usePaginationSR<ApiStudent>({
        route: "/alumnos",
        filters: computedFilters,
        perPage: 25,
        enabled: Boolean(selectedSchoolId)
    });

    useEffect(() => {
        pagination.refetch();
    }, [refresh])

    const formatted = useMemo(
        () => mapApiStudentsToStudents(pagination.data) ?? [],
        [pagination.data]
    );

    return (
        <>
            {pagination.loading && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando alumnos...</p>
                </div>
            )}
            {!pagination.loading && formatted.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No se encontraron estudiantes.
                </div>
            )}
            {!pagination.loading && formatted.length > 0 && (
                <>
                    <DataTable
                        columns={columns}
                        data={formatted}
                        renderCell={StudentTableItem}
                        pageSize={pagination.perPage}
                        className="mt-4"
                    />
                    <SSRPagination pagination={pagination} />
                </>
            )}
        </>
    )
}