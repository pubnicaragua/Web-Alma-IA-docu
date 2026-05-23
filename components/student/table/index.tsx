'use client'
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { SSRPagination } from "@/components/utils/pagination-sr";
import { usePaginationSR } from "@/hooks/use-pagination-sr";
import { ApiStudent, Student, mapApiStudentsToStudents } from "@/services/students-service";
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

    // Only send server-supported params (colegio_id, search, activo) to the API
    const serverFilters = useMemo(
        () => ({
            colegio_id: selectedSchoolId,
            search: searchParam || undefined,
            activo: filters?.status === "Todos" ? undefined :
                    filters?.status === "Inactivo" ? false : true,
        }),
        [searchParam, selectedSchoolId, filters?.status]
    );

    const pagination = usePaginationSR<ApiStudent>({
        route: "/alumnos",
        filters: serverFilters,
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

    // Apply client-side filters (level, course, age, status) since the backend doesn't support them
    const filteredData = useMemo(() => {
        return formatted.filter((student: Student) => {
            // Filter by level name
            if (filters?.levelName && filters.levelName !== "Todos") {
                if (student.level !== filters.levelName) return false;
            }
            // Filter by course name
            if (filters?.courseName && filters.courseName !== "Todos") {
                if (student.course !== filters.courseName) return false;
            }
            // Filter by min age
            if (filters?.minAge != null) {
                if (student.age < filters.minAge) return false;
            }
            // Filter by max age
            if (filters?.maxAge != null) {
                if (student.age > filters.maxAge) return false;
            }
            // Filter by status
            if (filters?.status && filters.status !== "Todos") {
                if (student.status !== filters.status) return false;
            }
            return true;
        });
    }, [formatted, filters]);

    return (
        <>
            {pagination.loading && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando alumnos...</p>
                </div>
            )}
            {!pagination.loading && filteredData.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No se encontraron estudiantes.
                </div>
            )}
            {!pagination.loading && filteredData.length > 0 && (
                <>
                    <p className="text-sm text-gray-500 mt-2">
                        Mostrando {filteredData.length} de {formatted.length} alumno(s)
                    </p>
                    <DataTable
                        columns={columns}
                        data={filteredData}
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