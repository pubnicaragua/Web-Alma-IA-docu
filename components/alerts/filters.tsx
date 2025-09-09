'use client'
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FilterDropdown } from "@/components/filter-dropdown";
import { DatePicker } from "@/components/ui/date-picker";
import { fetchPrority, fetchStates, fetchTypes } from "@/services/alerts-service";

interface PropTypes {
    setFilters: (filters: any) => void,
}

export function AlertTableFilters({ setFilters }: Readonly<PropTypes>) {
    const [filtersLoading, setFiltersLoading] = useState(true);
    const [catalogs, setCatalogs] = useState({});

    const form = useForm({
        defaultValues: {
            typeFilter: "Todos",
            priorityFilter: "Todos",
            statusFilter: "Todos",
            dateFilter: "Todos",
            selectedDate: null as Date | null,
            horaFilter: undefined as string | undefined,
        },
        mode: "onChange",
    });

    useEffect(() => {
        (async function () {
            const [statesData, typesData, prioritiesData] = await Promise.all([
                fetchStates(),
                fetchTypes(),
                fetchPrority(),
            ]);
            setCatalogs({
                states: ["Todos", ...statesData.map((s) => s.nombre_alerta_estado)],
                priorities: ["Todos", ...prioritiesData.map((p) => p.nombre)],
                types: ["Todos", ...typesData.map((t) => {
                    if (t.nombre === "SOS Alma") {
                        return t.nombre = "Sos"
                    } else {
                        return t.nombre
                    }
                })],
            });
            setFiltersLoading(false);
        })();
    }, []);

    useEffect(() => {
        const subscription = form.watch((values) => {
            setFilters(values);
        });

        return () => subscription.unsubscribe();
    }, [form]);


    return (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Controller
                name="typeFilter"
                control={form.control}
                render={({ field }) => (
                    <FilterDropdown
                        label="Tipo"
                        options={filtersLoading ? ["Cargando..."] : (catalogs as any).types}
                        disabled={filtersLoading}
                        onChange={field.onChange}
                        value={field.value}
                    />
                )}
            />

            <Controller
                name="priorityFilter"
                control={form.control}
                render={({ field }) => (
                    <FilterDropdown
                        label="Prioridad"
                        options={filtersLoading ? ["Cargando..."] : (catalogs as any).priorities}
                        disabled={filtersLoading}
                        onChange={field.onChange}
                        value={field.value}
                    />
                )}
            />

            <Controller
                name="statusFilter"
                control={form.control}
                render={({ field }) => (
                    <FilterDropdown
                        label="Estado"
                        options={filtersLoading ? ["Cargando..."] : (catalogs as any).states}
                        disabled={filtersLoading}
                        onChange={field.onChange}
                        value={field.value}
                    />
                )}
            />

            <div className="flex flex-col">
                <Controller
                    name="dateFilter"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdown
                            label="Fecha"
                            options={filtersLoading ? ["Cargando..."] : ["Todos", "Hoy", "Hasta..."]}
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value);
                                if (value !== "Hasta...") {
                                    form.setValue("selectedDate", null);
                                }
                            }}
                            disabled={filtersLoading}
                        />
                    )}
                />
                {form.watch("dateFilter") === "Hasta..." && (
                    <div className="mt-2">
                        <Controller
                            name="selectedDate"
                            control={form.control}
                            render={({ field }) => (
                                <DatePicker
                                    selected={field.value}
                                    onChange={field.onChange}
                                    placeholderText="Seleccione una fecha"
                                    className="w-full p-2 border rounded-md"
                                />
                            )}
                        />
                    </div>
                )}
            </div>
        </div>

    )


}