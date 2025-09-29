'use client'
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FilterDropdownObject } from "@/components/filter-dropdown-object";
import { FilterDropdown } from "@/components/filter-dropdown";
import { DatePicker } from "@/components/ui/date-picker";
import { fetchPrority, fetchStates, fetchTypes } from "@/services/alerts-service";

interface PropTypes {
    setFilters: (filters: any) => void,
}

interface AlertFilters {
    tipo: any | null;
    prioridad: any | null;
    estado: string | null;
    dateFilter: string;
    selectedDate: Date | null;
    horaFilter: string | undefined;
    motores: boolean;
}

export function AlertTableFilters({ setFilters }: Readonly<PropTypes>) {

    const [filtersLoading, setFiltersLoading] = useState(true);
    const [catalogs, setCatalogs] = useState({});

    const form = useForm<AlertFilters>({
        defaultValues: {
            tipo: null,
            prioridad: null,
            estado: null,
            dateFilter: "Todos",
            selectedDate: null as Date | null,
            motores: false,
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
                priorities: [{ alerta_prioridad_id: null, nombre: "Todos" }, ...prioritiesData],
                types: [{ alerta_tipo_id: null, nombre: "Todos" }, ...typesData.map((t) => {
                    if (t.nombre === "SOS Alma") {
                        t.nombre = "Sos"
                    }
                    return t
                })],
            });
            setFiltersLoading(false);
        })();
    }, []);

    useEffect(() => {
        if (!Object.keys(catalogs).length) return;

        let filters: any = localStorage.getItem("selectedTab");

        if (!filters) return;

        filters = JSON.parse(filters);

        if (filters?.tipo) {
            const tipo = (catalogs as any)?.types.find((t: any) => t.alerta_tipo_id == filters.tipo)
            form.setValue('tipo', tipo)
        }

        if (filters?.prioridad) {
            const prioridad = (catalogs as any)?.priorities.find((t: any) => t.alerta_prioridad_id == filters.prioridad)
            form.setValue('prioridad', prioridad)
        }

        if (filters?.estado) {
            form.setValue('estado', filters.estado)
        }

        if (filters?.motores) {
            form.setValue('motores', filters.motores)
        }

        localStorage.removeItem("selectedTab");

    }, [catalogs]);


    useEffect(() => {
        const subscription = form.watch((values) => {
            setFilters({
                alertas_tipo_alerta_tipo_id: values.tipo?.alerta_tipo_id,
                prioridad_id: values.prioridad?.alerta_prioridad_id,
                estado: values.estado == 'Todos' ? null : values.estado,
                dateFilter: values.dateFilter,
                selectedDate: values.selectedDate,
                horaFilter: values.horaFilter,
                motores: values.motores ? 1 : 0,
            });
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">

                <button
                    onClick={() => form.reset()}
                    aria-label="Eliminar filtros"
                    className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition text-sm"
                    type="button"
                >
                    Eliminar filtros
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Controller
                    name="tipo"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdownObject
                            label="Tipo"
                            labelKey={"nombre"}
                            idKey={"alerta_tipo_id"}
                            options={(catalogs as any).types ?? []}
                            disabled={filtersLoading}
                            onChange={field.onChange}
                            value={field.value}
                        />
                    )}
                />

                <Controller
                    name="prioridad"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdownObject
                            label="Prioridad"
                            labelKey={"nombre"}
                            idKey={"alerta_prioridad_id"}
                            options={(catalogs as any).priorities ?? []}
                            disabled={filtersLoading}
                            onChange={field.onChange}
                            value={field.value}
                        />
                    )}
                />

                <Controller
                    name="estado"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdown
                            label="Estado"
                            options={filtersLoading ? ["Cargando..."] : (catalogs as any).states}
                            disabled={filtersLoading}
                            onChange={field.onChange}
                            value={field.value ?? ""}
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
                                    if (value === "Hoy") {
                                        form.setValue("selectedDate", new Date());
                                        return;
                                    }
                                    if (value === "Todos" || !value) {
                                        form.setValue("selectedDate", null);
                                        return;
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

        </div>

    )
}