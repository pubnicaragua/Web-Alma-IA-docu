'use client';
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { useAxios } from "@/hooks/use-axios";
import { AlertFilterBuilder } from "@/services/alerts-service/filter-builder";
import { ApiAlert, fetchAlerts } from "@/services/alerts-service";
import { NoResults } from "../no-results";
import { AlertTableItem } from "./item";
import { LoadingState } from "../loading-state";

const columns = [
    { key: "student", title: "Alumno" },
    { key: "type", title: "Tipo de Alerta" },
    { key: "priority", title: "Prioridad" },
    { key: "status", title: "Estado" },
    { key: "date", title: "Fecha" },
    { key: "time", title: "Hora" },
];

interface PropTypes {
    filters: any;
}

export function AlertsTable({ filters }: Readonly<PropTypes>) {

    const axios = useAxios<ApiAlert[]>(fetchAlerts);
    const [currentPage, setCurrentPage] = useState(1);

    const filtered = useMemo(() => {
        if (!axios.data) return null;
        const builder = new AlertFilterBuilder(axios.data);
        builder
            .getByType(filters?.typeFilter ?? '')
            .getByPriority(filters?.priorityFilter ?? '')
            .getByStatus(filters?.statusFilter ?? '')
            .getByDate(filters?.dateFilter ?? '', filters?.selectedDate ?? '');
        return builder.build();
    }, [axios.data, filters]);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {axios.loading && !filtered && (
                <LoadingState />
            )}
            {(!axios.loading && filtered) ? (
                <DataTable
                    columns={columns}
                    data={filtered ?? []}
                    renderCell={AlertTableItem}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    pageSize={25}
                    className="mt-4"
                />
            ) : (
                <NoResults />
            )}
        </div>
    )
}