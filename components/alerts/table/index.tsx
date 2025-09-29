"use client";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { ApiAlert, mapApiAlertsToAlerts } from "@/services/alerts-service";
import { NoResults } from "../no-results";
import { AlertTableItem } from "./item";
import { LoadingState } from "../loading-state";
import { usePaginationSR } from "@/hooks/use-pagination-sr";
import { SSRPagination } from "@/components/utils/pagination-sr";
import { useUser } from "@/middleware/user-context";

const columns = [
    { key: "student", title: "Alumno" },
    { key: "type", title: "Tipo de Alerta", className: "text-center" },
    { key: "priority", title: "Prioridad" },
    { key: "status", title: "Estado" },
    { key: "resource", title: "Archivos" },
    { key: "date", title: "Fecha" },
    { key: "time", title: "Hora" },
];

interface PropTypes {
    filters: any;
}

export function AlertsTable({ filters }: Readonly<PropTypes>) {
    const { selectedSchoolId } = useUser();

    const computedFilters = useMemo(
        () => ({
            ...filters,
            colegio_id: selectedSchoolId,
        }),
        [filters, selectedSchoolId]
    );

    const pagination = usePaginationSR<ApiAlert>({
        route: "/alumnos/alertas",
        filters: computedFilters,
        perPage: 25,
    });

    const formatted = useMemo(
        () => mapApiAlertsToAlerts(pagination.data) ?? [],
        [pagination.data]
    );

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {pagination.loading && <LoadingState />}
            {!pagination.loading && formatted.length === 0 && <NoResults />}
            {!pagination.loading && formatted.length > 0 && (
                <>
                    <DataTable
                        columns={columns}
                        data={formatted}
                        renderCell={AlertTableItem}
                        pageSize={pagination.perPage}
                        className="mt-4"
                    />
                    <SSRPagination pagination={pagination} />
                </>
            )}
        </div>
    );
}