import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form"
import { AgeRangeFilter } from "@/components/agerangefilter";
import { FilterDropdown } from "@/components/filter-dropdown";
import { useUser } from "@/middleware/user-context";
import { FilterDropdownObject } from "@/components/filter-dropdown-object";

interface PropTypes {
    setFilters: (filters: any) => void,
    setRefresh: () => void,
}

interface FilterValues {
    levelFilter: any | null;
    courseFilter: any | null;
    statusFilter: string;
    minAge: number | undefined;
    maxAge: number | undefined;
}

const statusOptions = ["Activo", "Inactivo"];

export function StudentTableFilters({ setFilters, setRefresh }: Readonly<PropTypes>) {
    const { selectedSchoolId } = useUser();
    const [filtersLoading, setFiltersLoading] = useState(true);

    const [levelOptions, setLevelOptions] = useState<{ grado_id: number | null, nombre: string }[]>([]);
    const [courseOptions, setCourseOptions] = useState<{ curso_id: number | null, nombre_curso: string }[]>([]);

    const form = useForm<FilterValues>({
        defaultValues: {
            levelFilter: null,
            courseFilter: null,
            statusFilter: "Activo",
            minAge: undefined,
            maxAge: undefined,
        }
    })

    useEffect(() => {
        if (!selectedSchoolId) return;
        (async function () {
            const courses = await window.axios.get(`/colegios/cursos`,
                { params: { colegio_id: selectedSchoolId } })
                .then((res: any) => res.data);
            const levels = [...new Map(courses.map((c: any) => [c.grados.grado_id, c.grados])).values()] as { grado_id: number | null, nombre: string }[];
            setCourseOptions([{ curso_id: null, nombre_curso: 'Todos' }, ...courses]);
            setLevelOptions([{ grado_id: null, nombre: 'Todos' }, ...levels]);
            setFiltersLoading(false);
        })();
    }, [selectedSchoolId]);

    useEffect(() => {
        const subscription = form.watch((values) => {
            setFilters({
                grado_id: values?.levelFilter?.grado_id,
                curso_id: values?.courseFilter?.curso_id,
                min_edad: values.minAge,
                max_edad: values.maxAge,
                estado: values.statusFilter == 'Activo' ? 1 : 0,
            });
        });
        return () => subscription.unsubscribe();
    }, [form]);

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setRefresh()}
                    aria-label="Refrescar datos"
                    className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition text-sm"
                    type="button"
                >
                    Refrescar
                </button>
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
                    name="levelFilter"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdownObject
                            {...field}
                            label="Nivel"
                            labelKey="nombre"
                            idKey="grado_id"
                            options={levelOptions}
                            disabled={filtersLoading}
                        />
                    )}
                />

                <Controller
                    name="courseFilter"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdownObject
                            {...field}
                            label="Curso"
                            labelKey="nombre_curso"
                            idKey="curso_id"
                            options={courseOptions}
                            disabled={filtersLoading}
                        />
                    )}
                />

                <AgeRangeFilter
                    label="Edad"
                    minAge={form.watch("minAge")}
                    maxAge={form.watch("maxAge")}
                    onRangeChange={(min: number | null, max: number | null) => {
                        form.setValue("minAge", min ?? undefined);
                        form.setValue("maxAge", max ?? undefined);
                    }}
                />

                <Controller
                    name="statusFilter"
                    control={form.control}
                    render={({ field }) => (
                        <FilterDropdown
                            {...field}
                            label="Estado"
                            options={statusOptions}
                            disabled={filtersLoading}
                        />
                    )}
                />
            </div>
        </div>
    )
}