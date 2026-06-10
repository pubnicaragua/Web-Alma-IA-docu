'use client'
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { SSRPagination } from "@/components/utils/pagination-sr";
import { usePaginationSR } from "@/hooks/use-pagination-sr";
import { ApiStudent, Student, mapApiStudentsToStudents } from "@/services/students-service";
import { searchStudents } from "@/services/header-service";
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
    return (
        <Suspense fallback={<div className="bg-white rounded-lg shadow-sm p-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div><p className="text-gray-600">Cargando...</p></div>}>
            <StudentTableInner filters={filters} refresh={refresh} />
        </Suspense>
    );
}

function StudentTableInner({ filters, refresh }: Readonly<{ filters: any, refresh: boolean }>) {
    const { selectedSchoolId } = useUser();
    const searParams = useSearchParams();
    const searchParam = searParams.get("search") ?? "";

    const [searchResults, setSearchResults] = useState<Student[] | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Only send server-supported params (colegio_id, activo) to the API
    const serverFilters = useMemo(
        () => ({
            colegio_id: selectedSchoolId,
            activo: filters?.status === "Todos" ? undefined :
                filters?.status === "Inactivo" ? false : true,
        }),
        [selectedSchoolId, filters?.status]
    );

    const pagination = usePaginationSR<ApiStudent>({
        route: "/alumnos",
        filters: serverFilters,
        perPage: 25,
        enabled: Boolean(selectedSchoolId) && !searchParam
    });

    useEffect(() => {
        if (!searchParam) {
            pagination.refetch();
        }
    }, [searchParam, refresh])

    // Load search results when searchParam changes
    useEffect(() => {
        if (!selectedSchoolId) return;

        if (searchParam) {
            setSearchLoading(true);
            searchStudents(searchParam, selectedSchoolId)
                .then((data) => {
                    setSearchResults(data);
                })
                .catch((err) => {
                    console.error("Error al buscar alumnos:", err);
                    setSearchResults([]);
                })
                .finally(() => {
                    setSearchLoading(false);
                });
        } else {
            setSearchResults(null);
        }
    }, [searchParam, selectedSchoolId, refresh]);

    const formatted = useMemo(() => {
        if (searchResults !== null) {
            return searchResults;
        }
        return mapApiStudentsToStudents(pagination.data) ?? [];
    }, [searchResults, pagination.data]);

    // Apply client-side filters (level, course, age, status) since the backend doesn't support them
    const filteredData = useMemo(() => {
        return formatted.filter((student: Student) => {
            // If searching by name, we can bypass the level/course/age filters 
            // so the user can find the student regardless of current dropdowns
            if (searchParam) {
                // We might still want to apply status filter, but let's just return true 
                // to make sure they find the student!
                return true;
            }

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
    }, [formatted, filters, searchParam]);

    const isLoading = searchParam ? searchLoading : pagination.loading;

    return (
        <>
            {isLoading && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando alumnos...</p>
                </div>
            )}
            {!isLoading && filteredData.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No se encontraron estudiantes.
                </div>
            )}
            {!isLoading && filteredData.length > 0 && (
                <>
                    <p className="text-sm text-gray-500 mt-2">
                        {searchParam
                            ? `Mostrando ${filteredData.length} alumno(s)`
                            : `Mostrando ${filteredData.length} de ${formatted.length} alumno(s)`}
                    </p>
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        renderCell={StudentTableItem}
                        pageSize={25}
                        className="mt-4"
                    />
                    {!searchParam && <SSRPagination pagination={pagination} />}
                </>
            )}

        </>
    )
}